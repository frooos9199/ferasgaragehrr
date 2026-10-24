import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCollection } from '../../hooks/useCollection'
import { storage } from '../../config/firebase'
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { formatCurrency } from '../../utils/helpers'
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiAlertTriangle, FiUpload } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function Inventory() {
  const { t } = useTranslation()
  const { data: items, add, update, remove } = useCollection('inventory')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ partName: '', partNumber: '', quantity: 0, minQuantity: 5, buyPrice: 0, sellPrice: 0, minSellPrice: '' })
  const [selectedImages, setSelectedImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const imageInputRef = useRef(null)

  const resetForm = () => {
    setForm({ partName: '', partNumber: '', quantity: 0, minQuantity: 5, buyPrice: 0, sellPrice: 0, minSellPrice: '' })
    setSelectedImages([])
    setEditing(null)
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const filtered = items.filter(i =>
    i.partName?.includes(search) || i.partNumber?.includes(search)
  )

  const handleSave = async () => {
    if (!form.partName) return toast.error('Fill part name')
    const minSellPrice = form.minSellPrice === '' ? Number(form.sellPrice) : Number(form.minSellPrice)
    const data = { ...form, quantity: Number(form.quantity), minQuantity: Number(form.minQuantity), buyPrice: Number(form.buyPrice), sellPrice: Number(form.sellPrice), minSellPrice }
    const uploadedImages = []
    setUploading(true)
    try {
      for (const file of selectedImages) {
        const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const imageRef = ref(storage, `inventory/${Date.now()}_${crypto.randomUUID()}_${fileName}`)
        await uploadBytes(imageRef, file)
        const uploadedImage = { path: imageRef.fullPath }
        uploadedImages.push(uploadedImage)
        uploadedImage.url = await getDownloadURL(imageRef)
      }

      data.images = [...(editing?.images || []), ...uploadedImages]
      if (editing) await update(editing.id, data)
      else await add(data)
      resetForm()
      setShowForm(false)
      toast.success('✅')
    } catch (error) {
      console.error('Inventory save failed:', error)
      await Promise.allSettled(uploadedImages.map(image => deleteObject(ref(storage, image.path))))
      toast.error(t('inventory_save_failed'))
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (i) => {
    setForm({ partName: i.partName, partNumber: i.partNumber, quantity: i.quantity, minQuantity: i.minQuantity, buyPrice: i.buyPrice, sellPrice: i.sellPrice, minSellPrice: i.minSellPrice ?? i.sellPrice ?? '' })
    setSelectedImages([])
    setEditing(i)
    setShowForm(true)
  }

  const handleImageSelection = (event) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter(file => file.type.startsWith('image/') && file.size <= 8 * 1024 * 1024)
    if (validFiles.length !== files.length) toast.error(t('inventory_invalid_images'))
    setSelectedImages(current => [...current, ...validFiles])
    event.target.value = ''
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="font-heading text-xl md:text-2xl font-bold">{t('inventory')}</h2>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-primary flex items-center gap-2 text-sm md:text-base py-2 px-3 md:px-6">
          <FiPlus /> {t('add')}
        </button>
      </div>

      <div className="relative mb-4">
        <FiSearch className="absolute top-3.5 start-4 text-hrr-silver" />
        <input type="text" placeholder={t('search')} value={search} onChange={e => setSearch(e.target.value)} className="input-field ps-10" />
      </div>

      {showForm && (
        <div className="card mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input placeholder={t('part_name')} value={form.partName} onChange={e => setForm({ ...form, partName: e.target.value })} className="input-field" />
          <input placeholder={t('part_number')} value={form.partNumber} onChange={e => setForm({ ...form, partNumber: e.target.value })} className="input-field" dir="ltr" />
          <input type="number" placeholder={t('quantity')} value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="input-field" />
          <input type="number" placeholder={t('min_quantity')} value={form.minQuantity} onChange={e => setForm({ ...form, minQuantity: e.target.value })} className="input-field" />
          <input type="number" step="0.001" placeholder={t('buy_price')} value={form.buyPrice} onChange={e => setForm({ ...form, buyPrice: e.target.value })} className="input-field" />
          <input type="number" step="0.001" placeholder={t('sell_price')} value={form.sellPrice} onChange={e => setForm({ ...form, sellPrice: e.target.value })} className="input-field" />
          <input type="number" min="0" step="0.001" placeholder={t('inventory_min_sell_price')} value={form.minSellPrice} onChange={e => setForm({ ...form, minSellPrice: e.target.value })} className="input-field" />
          <div className="col-span-1 sm:col-span-2">
            <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm hover:bg-white/5">
              <FiUpload /> {t('inventory_add_images')}
              <input ref={imageInputRef} type="file" accept="image/*" multiple onChange={handleImageSelection} className="sr-only" />
            </label>
            {(editing?.images?.length > 0 || selectedImages.length > 0) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {(editing?.images || []).map((image, index) => (
                  <img key={image.path || image.url || index} src={image.url || image} alt={form.partName} className="h-16 w-16 rounded object-cover" />
                ))}
                {selectedImages.map((image, index) => (
                  <div key={`${image.name}-${index}`} className="flex h-16 max-w-40 items-center rounded bg-white/5 px-2 text-xs text-hrr-silver">
                    <span className="truncate">{image.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {Number(form.minSellPrice === '' ? form.sellPrice : form.minSellPrice) < Number(form.buyPrice) && (
            <p className="col-span-1 sm:col-span-2 flex items-center gap-2 text-sm font-semibold text-amber-300" role="alert">
              <FiAlertTriangle /> {t('inventory_minimum_below_cost_warning')}
            </p>
          )}
          <div className="col-span-1 sm:col-span-2 flex gap-2">
            <button onClick={handleSave} disabled={uploading} className="btn-primary disabled:opacity-50">{uploading ? t('inventory_uploading_images') : t('save')}</button>
            <button onClick={() => { resetForm(); setShowForm(false) }} disabled={uploading} className="btn-secondary">{t('cancel')}</button>
          </div>
        </div>
      )}

      <div className="card overflow-x-auto">
        {/* Desktop table */}
        <table className="w-full text-sm hidden md:table">
          <thead>
            <tr className="text-hrr-silver border-b border-hrr-silver/10">
              <th className="p-3">{t('photos')}</th>
              <th className="text-start p-3">{t('part_name')}</th>
              <th className="text-start p-3">{t('part_number')}</th>
              <th className="p-3">{t('quantity')}</th>
              <th className="p-3">{t('buy_price')}</th>
              <th className="p-3">{t('sell_price')}</th>
              <th className="p-3">{t('inventory_min_sell_price')}</th>
              <th className="p-3">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(i => (
              <tr key={i.id} className="table-row">
                <td className="p-3 text-center">
                  {i.images?.[0] && <img src={i.images[0].url || i.images[0]} alt={i.partName} className="mx-auto h-12 w-12 rounded object-cover" />}
                </td>
                <td className="p-3 font-bold">
                  {i.quantity <= i.minQuantity && <FiAlertTriangle className="inline text-red-400 me-1" />}
                  {i.partName}
                </td>
                <td className="p-3" dir="ltr">{i.partNumber}</td>
                <td className={`p-3 text-center font-bold ${i.quantity <= i.minQuantity ? 'text-red-400' : ''}`}>{i.quantity}</td>
                <td className="p-3 text-center">{formatCurrency(i.buyPrice)}</td>
                <td className="p-3 text-center">{formatCurrency(i.sellPrice)}</td>
                <td className="p-3 text-center">{formatCurrency(i.minSellPrice ?? i.sellPrice)}</td>
                <td className="p-3 text-center">
                  <button onClick={() => handleEdit(i)} className="text-blue-400 mx-1"><FiEdit2 /></button>
                  <button onClick={() => { if (confirm(t('confirm_delete'))) remove(i.id) }} className="text-red-400 mx-1"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Mobile cards */}
        <div className="md:hidden space-y-2">
          {filtered.map(i => (
            <div key={i.id} className="bg-hrr-steel rounded-lg p-3">
              <div className="flex items-center justify-between">
                {i.images?.[0] && <img src={i.images[0].url || i.images[0]} alt={i.partName} className="me-3 h-14 w-14 shrink-0 rounded object-cover" />}
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm flex items-center gap-1">
                    {i.quantity <= i.minQuantity && <FiAlertTriangle className="text-red-400" />}
                    {i.partName}
                  </p>
                  <p className="text-xs text-hrr-silver" dir="ltr">{i.partNumber}</p>
                  <div className="flex gap-3 mt-1 text-xs">
                    <span className={i.quantity <= i.minQuantity ? 'text-red-400 font-bold' : ''}>{t('quantity')}: {i.quantity}</span>
                    <span>{t('sell_price')}: {formatCurrency(i.sellPrice)}</span>
                  </div>
                  <p className="mt-1 text-xs text-hrr-silver">{t('inventory_min_sell_price')}: {formatCurrency(i.minSellPrice ?? i.sellPrice)}</p>
                </div>
                <div className="flex gap-2 ms-2 shrink-0">
                  <button onClick={() => handleEdit(i)} className="text-blue-400"><FiEdit2 /></button>
                  <button onClick={() => { if (confirm(t('confirm_delete'))) remove(i.id) }} className="text-red-400"><FiTrash2 /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

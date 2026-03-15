import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCollection } from '../../hooks/useCollection'
import { FORD_MODELS, YEARS } from '../../config/constants'
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiTruck, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function Customers() {
  const { t } = useTranslation()
  const { data: customers, add: addCustomer, update: updateCustomer, remove: removeCustomer } = useCollection('customers')
  const { data: cars, add: addCar, update: updateCar, remove: removeCar } = useCollection('cars')
  const { data: orders, update: updateOrder } = useCollection('workOrders')
  const { data: invoices, update: updateInvoice } = useCollection('invoices')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', notes: '' })
  const [carForm, setCarForm] = useState({ model: '', year: '', platePrefix: '', plateNum: '', vin: '' })
  const [showCarForm, setShowCarForm] = useState(false)
  const [editingCar, setEditingCar] = useState(null)

  const filtered = customers.filter(c =>
    c.name?.includes(search) || c.phone?.includes(search)
  )

  const getCustomerCars = (customerId) => cars.filter(c => c.customerId === customerId)

  // تحديث بيانات العميل في كل الأماكن
  const syncCustomerData = async (customerId, newName, newPhone) => {
    // تحديث أوامر الشغل
    orders.filter(o => o.customerId === customerId).forEach(o => {
      updateOrder(o.id, { customerName: newName, customerPhone: newPhone })
    })
    // تحديث الفواتير
    invoices.filter(i => i.customerId === customerId).forEach(i => {
      updateInvoice(i.id, { customerName: newName, customerPhone: newPhone })
    })
    // تحديث السيارات
    cars.filter(c => c.customerId === customerId).forEach(c => {
      updateCar(c.id, { customerName: newName, customerPhone: newPhone })
    })
  }

  // تحديث بيانات السيارة في كل الأماكن
  const syncCarData = async (carId, newModel, newYear, newPlate) => {
    orders.filter(o => o.carId === carId).forEach(o => {
      updateOrder(o.id, { carModel: newModel, carYear: newYear, carPlate: newPlate })
    })
    invoices.filter(i => i.carId === carId).forEach(i => {
      updateInvoice(i.id, { carModel: newModel, carYear: newYear, carPlate: newPlate })
    })
  }

  const handleSaveCustomer = async () => {
    if (!form.name || !form.phone) return toast.error('Fill name & phone')
    if (editing) {
      await updateCustomer(editing.id, form)
      await syncCustomerData(editing.id, form.name, form.phone)
      toast.success('✅ Updated')
    } else {
      await addCustomer(form)
      toast.success('✅ Added')
    }
    setForm({ name: '', phone: '', notes: '' })
    setShowForm(false)
    setEditing(null)
  }

  const handleEditCustomer = (c) => {
    setForm({ name: c.name, phone: c.phone, notes: c.notes || '' })
    setEditing(c)
    setShowForm(true)
  }

  const handleDeleteCustomer = async (id) => {
    if (!confirm(t('confirm_delete'))) return
    // حذف سيارات العميل
    cars.filter(c => c.customerId === id).forEach(c => removeCar(c.id))
    await removeCustomer(id)
    toast.success('✅')
  }

  const handleSaveCar = async (customerId) => {
    if (!carForm.model || !carForm.year || !carForm.platePrefix || !carForm.plateNum) return toast.error('Fill car details')
    const customer = customers.find(c => c.id === customerId)
    const plateNumber = `${carForm.platePrefix} / ${carForm.plateNum}`
    const data = {
      ...carForm,
      plateNumber,
      customerId,
      customerName: customer?.name || '',
      customerPhone: customer?.phone || '',
    }
    if (editingCar) {
      await updateCar(editingCar.id, data)
      await syncCarData(editingCar.id, carForm.model, carForm.year, carForm.plateNumber)
      toast.success('✅ Car updated')
    } else {
      await addCar(data)
      toast.success('✅ Car added')
    }
    setCarForm({ model: '', year: '', platePrefix: '', plateNum: '', vin: '' })
    setShowCarForm(false)
    setEditingCar(null)
  }

  const handleEditCar = (car) => {
    const parts = (car.plateNumber || '').split(' / ')
    setCarForm({ model: car.model, year: car.year, platePrefix: parts[0] || '', plateNum: parts[1] || '', vin: car.vin || '' })
    setEditingCar(car)
    setShowCarForm(true)
  }

  const handleDeleteCar = async (carId) => {
    if (!confirm(t('confirm_delete'))) return
    await removeCar(carId)
    toast.success('✅')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="font-heading text-xl md:text-2xl font-bold">{t('customers')}</h2>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', phone: '', notes: '' }) }}
          className="btn-primary flex items-center gap-2 text-sm md:text-base py-2 px-3 md:px-6">
          <FiPlus /> {t('add')}
        </button>
      </div>

      {/* بحث */}
      <div className="relative mb-4">
        <FiSearch className="absolute top-3.5 start-4 text-hrr-silver" />
        <input
          type="text"
          placeholder={`${t('search')} (${t('name')} / ${t('phone')})...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field ps-10"
        />
      </div>

      {/* فورم إضافة/تعديل عميل */}
      {showForm && (
        <div className="card mb-4 border-hrr-red/30">
          <h3 className="font-heading font-bold mb-3">{editing ? t('edit') : t('add')} {t('customer')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder={t('name')} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" />
            <input placeholder={t('phone')} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" dir="ltr" />
          </div>
          <textarea placeholder={t('notes')} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input-field mt-3" rows={2} />
          <div className="flex gap-2 mt-3">
            <button onClick={handleSaveCustomer} className="btn-primary">{t('save')}</button>
            <button onClick={() => { setShowForm(false); setEditing(null) }} className="btn-secondary">{t('cancel')}</button>
          </div>
        </div>
      )}

      {/* قائمة العملاء */}
      <div className="space-y-3">
        {filtered.map(c => {
          const customerCars = getCustomerCars(c.id)
          const isExpanded = expandedId === c.id

          return (
            <div key={c.id} className={`card transition-all ${isExpanded ? 'border-hrr-red/40' : ''}`}>
              {/* هيدر العميل */}
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : c.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold">{c.name}</span>
                    <span className="text-hrr-silver text-sm" dir="ltr">{c.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {customerCars.length > 0 ? (
                      customerCars.map(car => (
                        <span key={car.id} className="badge bg-hrr-steel text-hrr-silver text-xs">
                          🚗 Ford {car.model} {car.year}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-hrr-silver">{t('no_results')}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ms-2 shrink-0">
                  <span className="badge bg-blue-600/20 text-blue-400 text-xs">{customerCars.length} {t('cars')}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleEditCustomer(c) }} className="text-blue-400 hover:text-blue-300 p-1"><FiEdit2 /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteCustomer(c.id) }} className="text-red-400 hover:text-red-300 p-1"><FiTrash2 /></button>
                  {isExpanded ? <FiChevronUp className="text-hrr-silver" /> : <FiChevronDown className="text-hrr-silver" />}
                </div>
              </div>

              {/* تفاصيل - سيارات العميل */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-hrr-silver/10" onClick={e => e.stopPropagation()}>
                  {c.notes && <p className="text-hrr-silver text-sm bg-hrr-steel rounded-lg p-3 mb-3">{c.notes}</p>}

                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-sm flex items-center gap-1"><FiTruck /> {t('cars')}</h4>
                    <button onClick={() => { setShowCarForm(true); setEditingCar(null); setCarForm({ model: '', year: '', platePrefix: '', plateNum: '', vin: '' }) }}
                      className="text-sm text-hrr-red hover:underline flex items-center gap-1">
                      <FiPlus /> {t('add')} {t('car')}
                    </button>
                  </div>

                  {/* فورم إضافة/تعديل سيارة */}
                  {showCarForm && (
                    <div className="bg-hrr-steel rounded-lg p-3 mb-3 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <select value={carForm.model} onChange={e => setCarForm({ ...carForm, model: e.target.value })} className="input-field py-2 text-sm">
                          <option value="">{t('model')}...</option>
                          {FORD_MODELS.map(m => <option key={m} value={m}>Ford {m}</option>)}
                        </select>
                        <select value={carForm.year} onChange={e => setCarForm({ ...carForm, year: e.target.value })} className="input-field py-2 text-sm">
                          <option value="">{t('year')}...</option>
                          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                        <div className="flex gap-2 items-center">
                          <input placeholder="1" value={carForm.platePrefix} onChange={e => setCarForm({ ...carForm, platePrefix: e.target.value.slice(0, 2) })} className="input-field py-2 text-sm w-16 text-center" maxLength={2} dir="ltr" />
                          <span className="text-hrr-silver font-bold">/</span>
                          <input placeholder="12345" value={carForm.plateNum} onChange={e => setCarForm({ ...carForm, plateNum: e.target.value.replace(/\D/g, '').slice(0, 6) })} className="input-field py-2 text-sm flex-1" dir="ltr" />
                        </div>
                        <input placeholder={`${t('vin')} (${t('notes')})`} value={carForm.vin} onChange={e => setCarForm({ ...carForm, vin: e.target.value })} className="input-field py-2 text-sm" dir="ltr" />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleSaveCar(c.id)} className="btn-primary text-sm py-1.5">{t('save')}</button>
                        <button onClick={() => { setShowCarForm(false); setEditingCar(null) }} className="btn-secondary text-sm py-1.5">{t('cancel')}</button>
                      </div>
                    </div>
                  )}

                  {/* قائمة السيارات */}
                  <div className="space-y-2">
                    {customerCars.map(car => (
                      <div key={car.id} className="flex items-center justify-between p-3 bg-hrr-dark rounded-lg">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm">🚗 Ford {car.model} <span className="text-hrr-silver">{car.year}</span></p>
                          <div className="flex gap-3 text-xs text-hrr-silver mt-1 flex-wrap">
                            <span>🔢 {car.plateNumber}</span>
                            {car.vin && <span dir="ltr">VIN: {car.vin}</span>}
                          </div>
                        </div>
                        <div className="flex gap-1 ms-2 shrink-0">
                          <button onClick={() => handleEditCar(car)} className="text-blue-400 hover:text-blue-300 p-1"><FiEdit2 size={14} /></button>
                          <button onClick={() => handleDeleteCar(car.id)} className="text-red-400 hover:text-red-300 p-1"><FiTrash2 size={14} /></button>
                        </div>
                      </div>
                    ))}
                    {customerCars.length === 0 && (
                      <p className="text-center text-hrr-silver text-sm py-4">{t('no_results')} - {t('add')} {t('car')}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {filtered.length === 0 && <p className="text-center text-hrr-silver py-12">{t('no_results')}</p>}
      </div>
    </div>
  )
}

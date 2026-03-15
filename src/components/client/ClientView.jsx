import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { STATUS_COLORS } from '../../config/constants'

const STATUS_STEPS = ['received', 'diagnosis', 'in_progress', 'done', 'delivered']
const STATUS_EN = { received: 'Received', diagnosis: 'Diagnosis', in_progress: 'In Progress', done: 'Ready', delivered: 'Delivered' }

export default function ClientView() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem('hrr_workOrders')
    if (saved) {
      const orders = JSON.parse(saved)
      const found = orders.find(o => o.id === orderId)
      if (found) setOrder(found)
    }
  }, [orderId])

  if (!order) return <div className="min-h-screen bg-hrr-dark flex items-center justify-center text-white">Order not found</div>

  const currentStep = STATUS_STEPS.indexOf(order.status)

  return (
    <div className="min-h-screen bg-hrr-dark text-white p-4 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="font-heading text-3xl font-bold text-hrr-red">🏁 HRR</h1>
        <p className="text-hrr-silver">HOT ROD RACING</p>
      </div>

      <div className="card mb-4">
        <h2 className="font-heading text-xl font-bold mb-2">Ford {order.carModel} {order.carYear}</h2>
        <p className="text-hrr-silver">Plate: {order.carPlate}</p>
        <p className="text-hrr-silver">Order: {order.orderNumber}</p>
        <p className="text-hrr-silver">Date: {formatDate(order.createdAt)}</p>
      </div>

      <div className="card mb-4">
        <h3 className="font-bold mb-4">Status</h3>
        <div className="flex justify-between">
          {STATUS_STEPS.map((s, i) => (
            <div key={s} className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= currentStep ? STATUS_COLORS[s] + ' text-white' : 'bg-hrr-steel text-hrr-silver'}`}>
                {i <= currentStep ? '✓' : i + 1}
              </div>
              <span className={`text-xs mt-1 ${i <= currentStep ? 'text-white' : 'text-hrr-silver'}`}>{STATUS_EN[s]}</span>
            </div>
          ))}
        </div>
      </div>

      {order.photos?.length > 0 && (
        <div className="card mb-4">
          <h3 className="font-bold mb-3">Photos</h3>
          <div className="grid grid-cols-3 gap-2">
            {order.photos.map((p, i) => (
              <div key={i} className="relative">
                <img src={p.url} alt="" className="w-full h-28 object-cover rounded-lg" />
                <span className="absolute top-1 start-1 badge bg-black/70 text-white text-xs">{p.phase}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {order.totalCost > 0 && (
        <div className="card">
          <h3 className="font-bold mb-2">Invoice</h3>
          <div className="text-2xl font-bold text-hrr-gold">{formatCurrency(order.totalCost)}</div>
        </div>
      )}

      <p className="text-center text-hrr-silver text-sm mt-8">Thank you for choosing HRR! 🏁</p>
    </div>
  )
}

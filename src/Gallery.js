import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, query, getDocs } from 'firebase/firestore';

function Gallery() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchCompletedCars = async () => {
      try {
        console.log('Fetching gallery data...');
        const q = query(collection(db, 'jobCards'));
        
        const snapshot = await getDocs(q);
        console.log('Total documents:', snapshot.docs.length);
        
        const carsData = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(car => {
            console.log('Checking car:', car.carNumber, 'Status:', car.status, 'Images:', car.images?.length || 0);
            return (
              // Only completed/delivered cars with images
              (car.status === 'Completed' || car.status === 'Delivered') &&
              car.images && 
              car.images.length > 0
            );
          })
          .sort((a, b) => {
            // Sort by creation date, newest first
            const aTime = a.createdAt?.seconds || 0;
            const bTime = b.createdAt?.seconds || 0;
            return bTime - aTime;
          });
        
        console.log('Filtered cars:', carsData.length);
        setCars(carsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching gallery:', error);
        // Show error instead of infinite loading
        setCars([]);
        setLoading(false);
      }
    };

    fetchCompletedCars();
  }, []);

  const filteredCars = filter === 'all' 
    ? cars 
    : cars.filter(car => car.model === filter);

  const models = [...new Set(cars.map(car => car.model))];

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: '2rem', color: '#fff', textAlign: 'center' }}>
        <img 
          src="/mustang-parts.png" 
          alt="HRR Logo" 
          style={{ 
            width: 180, 
            marginTop: '4rem',
            marginBottom: '1.5rem',
            borderRadius: '15px',
            border: '2px solid #00D9FF',
            padding: '15px',
            background: 'rgba(26,26,46,0.8)',
            boxShadow: '0 10px 30px rgba(0,217,255,0.4)'
          }} 
        />
        <h2 style={{ color: '#00D9FF', marginTop: '2rem' }}>Loading Gallery...</h2>
        <p style={{ color: '#888', marginTop: '1rem' }}>Fetching completed projects from database...</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <img 
          src="/mustang-parts.png" 
          alt="HRR Logo" 
          style={{ 
            width: 180, 
            marginBottom: '1.5rem',
            borderRadius: '15px',
            border: '2px solid #00D9FF',
            padding: '15px',
            background: 'rgba(26,26,46,0.8)',
            boxShadow: '0 10px 30px rgba(0,217,255,0.4)'
          }} 
        />
        <h1 style={{ 
          fontSize: '2.5rem', 
          background: 'linear-gradient(90deg, #00D9FF 0%, #FF6B00 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
          marginBottom: '0.5rem'
        }}>
          🏁 Our Work Gallery
        </h1>
        <p style={{ color: '#FFD700', fontSize: '1.2rem', fontWeight: '600' }}>
          Showcase of Ford Specialist Excellence
        </p>
        <p style={{ color: '#999', marginTop: '0.5rem' }}>
          {cars.length} Completed Projects
        </p>
      </div>

      {/* Filter Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        justifyContent: 'center', 
        flexWrap: 'wrap',
        marginBottom: '2rem',
        maxWidth: '1200px',
        margin: '0 auto 2rem'
      }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            background: filter === 'all' ? 'linear-gradient(90deg, #00D9FF 0%, #0099CC 100%)' : 'rgba(255,255,255,0.1)',
            color: '#fff',
            border: filter === 'all' ? '2px solid #00D9FF' : '2px solid rgba(255,255,255,0.2)',
            borderRadius: '25px',
            padding: '0.7rem 1.5rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s',
            fontSize: '0.95rem'
          }}
        >
          All ({cars.length})
        </button>
        {models.map(model => (
          <button
            key={model}
            onClick={() => setFilter(model)}
            style={{
              background: filter === model ? 'linear-gradient(90deg, #FF6B00 0%, #FFD700 100%)' : 'rgba(255,255,255,0.1)',
              color: '#fff',
              border: filter === model ? '2px solid #FF6B00' : '2px solid rgba(255,255,255,0.2)',
              borderRadius: '25px',
              padding: '0.7rem 1.5rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s',
              fontSize: '0.95rem'
            }}
          >
            {model} ({cars.filter(c => c.model === model).length})
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '2rem',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        {filteredCars.map(car => (
          <div 
            key={car.id}
            style={{
              background: 'rgba(26,26,46,0.95)',
              borderRadius: '18px',
              overflow: 'hidden',
              border: '2px solid #00D9FF55',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,217,255,0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)';
            }}
          >
            {/* Main Image */}
            {car.images && car.images[0] && (
              <div style={{ 
                width: '100%', 
                height: '250px', 
                overflow: 'hidden',
                position: 'relative'
              }}>
                <img 
                  src={car.images[0]} 
                  alt={`${car.make} ${car.model}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'linear-gradient(135deg, #00D9FF 0%, #FF6B00 100%)',
                  color: '#fff',
                  padding: '0.4rem 1rem',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  fontSize: '0.85rem'
                }}>
                  {car.status}
                </div>
              </div>
            )}

            {/* Car Info */}
            <div style={{ padding: '1.5rem' }}>
              <h2 style={{
                fontSize: '1.5rem',
                color: '#00D9FF',
                marginBottom: '0.5rem',
                fontWeight: 'bold'
              }}>
                {car.make} {car.model}
              </h2>
              
              <div style={{ color: '#FFD700', fontSize: '1.1rem', marginBottom: '1rem', fontWeight: '600' }}>
                {car.year || 'Year N/A'}
              </div>

              {car.specs && (
                <p style={{ color: '#ccc', fontSize: '0.95rem', marginBottom: '1rem' }}>
                  📋 {car.specs}
                </p>
              )}

              {/* Image Gallery Thumbnails */}
              {car.images && car.images.length > 1 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                  gap: '0.5rem',
                  marginTop: '1rem'
                }}>
                  {car.images.slice(0, 4).map((img, idx) => (
                    <div 
                      key={idx}
                      style={{
                        width: '100%',
                        height: '80px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '2px solid #00D9FF44',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      onClick={() => window.open(img, '_blank')}
                    >
                      <img 
                        src={img} 
                        alt={`View ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      {idx === 3 && car.images.length > 4 && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background: 'rgba(0,0,0,0.7)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 'bold',
                          fontSize: '1.2rem'
                        }}>
                          +{car.images.length - 4}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Date */}
              {car.createdAt && (
                <div style={{ 
                  marginTop: '1rem', 
                  paddingTop: '1rem', 
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  color: '#888',
                  fontSize: '0.85rem'
                }}>
                  🗓️ Completed: {new Date(car.createdAt.seconds * 1000).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCars.length === 0 && (
        <div style={{ textAlign: 'center', color: '#888', marginTop: '4rem', fontSize: '1.2rem' }}>
          <p>No completed projects yet.</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Check back soon for our amazing work! 🏁</p>
        </div>
      )}

      {/* Footer */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '4rem', 
        paddingTop: '2rem', 
        borderTop: '1px solid rgba(255,255,255,0.1)',
        color: '#888'
      }}>
        <p style={{ fontSize: '1.1rem', color: '#00D9FF', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          🏁 HOT ROD RACING (HRR)
        </p>
        <p style={{ fontSize: '0.95rem' }}>Ford Specialist Garage - Kuwait</p>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
          📞 +965 50540999 | 🌐 www.q8hrr.com
        </p>
      </div>
    </main>
  );
}

export default Gallery;

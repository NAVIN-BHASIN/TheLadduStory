import React from 'react';

export default function DashboardView({ orders, inventory }) {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrders = orders.length;

  const walkInCount = orders.filter((o) => o.channel === 'WALK_IN').length;
  const waCount = orders.filter((o) => o.channel === 'WHATSAPP').length;
  const igCount = orders.filter((o) => o.channel === 'INSTAGRAM').length;

  const lowStockItems = inventory.filter((i) => i.currentStock <= i.minThreshold);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '24px' }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e7dfd8' }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '700' }}>TODAY'S REVENUE</div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#831843', marginTop: '6px' }}>₹{totalRevenue.toLocaleString('en-IN')}</div>
          <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '600', marginTop: '4px' }}>↑ +18% vs yesterday</div>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e7dfd8' }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '700' }}>TOTAL ORDERS</div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: '#1f2937', marginTop: '6px' }}>{totalOrders}</div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>Walk-in + Social Commerce</div>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e7dfd8' }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '700' }}>CHANNEL DISTRIBUTION</div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', fontSize: '0.95rem', fontWeight: '700' }}>
            <span style={{ color: '#831843' }}>🏪 POS: {walkInCount}</span>
            <span style={{ color: '#059669' }}>💬 WA: {waCount}</span>
            <span style={{ color: '#db2777' }}>📸 IG: {igCount}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>Unified central ledger</div>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e7dfd8' }}>
          <div style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '700' }}>STOCK HEALTH</div>
          <div style={{ fontSize: '1.9rem', fontWeight: '800', color: lowStockItems.length > 0 ? '#dc2626' : '#059669', marginTop: '6px' }}>
            {lowStockItems.length > 0 ? `${lowStockItems.length} Low Stock` : 'All Healthy'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '4px' }}>Gond Immunity Laddu (Left: 8)</div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e7dfd8', padding: '22px' }}>
        <h3 style={{ margin: '0 0 16px', color: '#4a121e' }}>Real-time Omnichannel Order Stream</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f9fafb', textAlign: 'left', color: '#6b7280', borderBottom: '1px solid #e7dfd8' }}>
              <th style={{ padding: '12px' }}>Order ID</th>
              <th style={{ padding: '12px' }}>Channel</th>
              <th style={{ padding: '12px' }}>Customer</th>
              <th style={{ padding: '12px' }}>Amount</th>
              <th style={{ padding: '12px' }}>Payment</th>
              <th style={{ padding: '12px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((ord) => (
              <tr key={ord.orderId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px', fontWeight: '700', color: '#831843' }}>{ord.orderId}</td>
                <td style={{ padding: '12px' }}>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      background: ord.channel === 'WALK_IN' ? '#fdf2f8' : ord.channel === 'WHATSAPP' ? '#ecfdf5' : '#fdf4ff',
                      color: ord.channel === 'WALK_IN' ? '#831843' : ord.channel === 'WHATSAPP' ? '#065f46' : '#86198f'
                    }}
                  >
                    {ord.channel}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{ord.customerName}</td>
                <td style={{ padding: '12px', fontWeight: '800' }}>₹{ord.totalAmount.toLocaleString('en-IN')}</td>
                <td style={{ padding: '12px' }}>{ord.paymentStatus} ({ord.paymentMethod})</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ background: '#f3f4f6', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '700' }}>
                    {ord.orderStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
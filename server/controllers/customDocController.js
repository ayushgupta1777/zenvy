import Order from '../models/Order.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * @desc    Generate a Human-Readable Custom Pick List (HTML)
 * @route   GET /api/admin/orders/:orderId/pick-list
 * @access  Private (Admin)
 */
export const getCustomPickList = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('items.product', 'title images sku description')
      .populate('user', 'name email phone');

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    // Prepare HTML for the Pick List
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pick List - ${order.orderNo}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; color: #333; background: #f4f7f6; }
          .container { max-width: 800px; margin: auto; background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { display: flex; justify-content: space-between; align-items: start; border-bottom: 2px solid #4F46E5; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #4F46E5; }
          .order-meta { text-align: right; }
          .order-no { font-size: 20px; font-weight: bold; color: #111827; margin: 0; }
          .date { color: #6B7280; font-size: 14px; }
          
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
          .section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #6B7280; margin-bottom: 10px; font-weight: 700; }
          .address-box { background: #F9FAFB; padding: 15px; border-radius: 8px; border: 1px solid #E5E7EB; }
          .address-name { font-weight: bold; font-size: 16px; margin-bottom: 5px; }
          .address-text { font-size: 14px; line-height: 1.5; color: #374151; }
          
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th { text-align: left; background: #F9FAFB; padding: 12px; border-bottom: 2px solid #E5E7EB; font-size: 14px; color: #374151; }
          .items-table td { padding: 15px 12px; border-bottom: 1px solid #F3F4F6; vertical-align: middle; }
          .item-row:last-child td { border-bottom: none; }
          .item-main { display: flex; align-items: center; gap: 15px; }
          .item-img { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; background: #eee; }
          .item-info { display: flex; flex-direction: column; }
          .item-title { font-weight: 600; color: #111827; font-size: 15px; }
          .item-sku { font-size: 12px; color: #4F46E5; font-weight: 700; margin-top: 4px; }
          
          .qty-box { background: #EEF2FF; color: #4F46E5; font-weight: bold; padding: 5px 12px; border-radius: 6px; display: inline-block; font-size: 16px; }
          .price-text { font-weight: 600; color: #111827; }
          
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center; font-size: 12px; color: #9CA3AF; }
          
          @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; border: none; }
            .no-print { display: none; }
          }
          
          .print-btn { background: #4F46E5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; cursor: pointer; border: none; }
          .actions { text-align: center; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="actions no-print">
          <button class="print-btn" onclick="window.print()">Print Pickup Slip</button>
        </div>
        
        <div class="container">
          <div class="header">
            <div class="logo">Premium Pick List</div>
            <div class="order-meta">
              <p class="order-no">Order #${order.orderNo}</p>
              <p class="date">${new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
            </div>
          </div>
          
          <div class="grid">
            <div>
              <div class="section-title">Shipping To:</div>
              <div class="address-box">
                <div class="address-name">${order.shippingAddress.name}</div>
                <div class="address-text">
                  ${order.shippingAddress.addressLine1}<br>
                  ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br>
                  Phone: <strong>${order.shippingAddress.phone}</strong>
                </div>
              </div>
            </div>
            <div>
              <div class="section-title">Payment Info:</div>
              <div class="address-box">
                <div class="address-text">
                  Method: <span style="text-transform: uppercase; font-weight: bold;">${order.paymentMethod}</span><br>
                  Status: <span style="text-transform: uppercase;">${order.paymentStatus}</span><br>
                  Total: <span style="font-size: 18px; font-weight: bold; color: #4F46E5;">₹${order.total}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="section-title">Items to Pack:</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Product Details</th>
                <th style="text-align: center;">Quantity</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr class="item-row">
                  <td>
                    <div class="item-main">
                      <div class="item-info">
                        <div class="item-title">${item.product?.title || 'Unknown Product'}</div>
                        <div class="item-sku">SKU: ${item.sku || 'N/A'}</div>
                      </div>
                    </div>
                  </td>
                  <td style="text-align: center;">
                    <div class="qty-box">x ${item.quantity}</div>
                  </td>
                  <td style="text-align: right;" class="price-text">₹${item.finalPrice}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            Generated on ${new Date().toLocaleString()} for Admin Use Only
          </div>
        </div>
      </body>
      </html>
    `;

    res.header('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    next(error);
  }
};

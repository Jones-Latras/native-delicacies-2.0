export default function DeliveryPolicyPage() {
  return (
    <div>
      <h1>Delivery Areas & Fees</h1>
      <p><em>Last updated: March 2025</em></p>

      <h2>Delivery Coverage</h2>
      <p>
        We currently deliver to select areas within Metro Manila. Our delivery coverage is expanding regularly, so please check back if your area is not yet served.
      </p>

      <h3>Areas We Serve</h3>
      <ul>
        <li>Quezon City (all barangays)</li>
        <li>Manila City</li>
        <li>Makati City</li>
        <li>Pasig City</li>
        <li>Mandaluyong City</li>
        <li>San Juan City</li>
        <li>Marikina City</li>
        <li>Taguig City</li>
        <li>Parañaque City</li>
        <li>Pasay City</li>
      </ul>

      <h2>Delivery Fees</h2>
      <table>
        <thead>
          <tr>
            <th>Distance from Store</th>
            <th>Delivery Fee</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Within 5 km</td>
            <td>₱50.00</td>
          </tr>
          <tr>
            <td>5 — 10 km</td>
            <td>₱80.00</td>
          </tr>
          <tr>
            <td>10 — 15 km</td>
            <td>₱120.00</td>
          </tr>
          <tr>
            <td>15+ km</td>
            <td>₱150.00</td>
          </tr>
        </tbody>
      </table>
      <p>
        <strong>Free delivery</strong> is available for orders ₱1,500 and above within our delivery area.
      </p>

      <h2>Delivery Times</h2>
      <ul>
        <li><strong>Standard orders:</strong> 45 minutes — 1.5 hours from confirmation</li>
        <li><strong>Scheduled orders:</strong> Delivered at your chosen time</li>
        <li><strong>Peak hours (11 AM — 1 PM, 5 PM — 7 PM):</strong> Delivery may take up to 2 hours</li>
      </ul>

      <h2>Minimum Order</h2>
      <p>
        A minimum order of <strong>₱200</strong> is required for all delivery orders. There is no minimum for pickup orders.
      </p>

      <h2>Pickup Option</h2>
      <p>
        You can always choose to pick up your order at our store. Pickup orders are typically ready within 30 — 45 minutes of confirmation.
      </p>
    </div>
  );
}

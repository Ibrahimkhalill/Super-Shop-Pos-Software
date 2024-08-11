import React from "react";
import "./salereportpos.css";
// import Barcode from "react-barcode";
export const SaleReportPos = React.forwardRef((props, ref) => {
  //   const { fixData, totalAmount, discount, VAT, paid } = props;
  const { rows, totalAmount, dateAquire, VAT, discount, invoiceNumber } = props;

  return (
    <>
      console.log(items);
      <div ref={ref} className="pos-pinter">
        <div className="container">
          <div className="receipt_header">
            <h1>
              <span>IRANI MINI BAZAR</span>
            </h1>
            <h2>
              Address: Khilpara Bazar, Chatkhil, Noakhali
              <span>Phone: +8801830112972</span>
            </h2>
          </div>

          <div className="receipt_body">
            <div
              style={{
                fontSize: "13px",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Invoice/Bill
            </div>

            <div className="date_time_con">
              <div>Invoice No:- {invoiceNumber}</div>
              <div className="date">
                <span>Date : </span>
                {dateAquire}
              </div>
            </div>

            <div className="items">
              <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                Description
              </span>
              <div className="hrline"></div>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>QTY</th>
                    <th>Item Total</th>
                  </tr>
                </thead>

                <tbody>
                  {rows &&
                    rows.map((item, index) => {
                      return (
                        <tr key={index}>
                          <td>
                            {item.ProductTrace ? item.ProductTrace.name : ""}
                          </td>
                          <td>
                            {item.quantity_no} {item.Unit ? item.Unit.unit : ""}
                          </td>
                          <td>
                            {(
                              parseFloat(item.sale_price || 0) *
                              parseFloat(item.quantity_no || 0)
                            ).toFixed(1)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>

                <tfoot>
                  <tr>
                    <td>Vat</td>
                    <td></td>
                    <td>{VAT}</td>
                  </tr>
                  <tr>
                    <td>Discount</td>
                    <td></td>
                    <td>{discount}</td>
                  </tr>
                 
                  <tr>
                    <td>Total</td>
                    <td></td>
                    <td>{totalAmount}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <h3 className="thank">Thank You, Come Again</h3>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "12px" }}>
              Terms & Conditions : No Cash Refund
            </div>
            <div style={{ fontSize: "12px" }}>Powered By</div>
            <span style={{ fontSize: "12px" }}>
              &copy; MerinaSoft, 173 Arambag, Motijheel
            </span>
          </div>
        </div>
      </div>
    </>
  );
});

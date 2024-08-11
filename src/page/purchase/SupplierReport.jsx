import React, { useEffect, useState, useRef, useCallback } from "react";
import "./supplier_report.css";
import update from "../../image/Update.png";
import save from "../../image/Save.png";
import reset from "../../image/reset.png";
import Excel from "../../image/excel.webp";
import { ToastContainer, toast } from "react-toastify";
import { MdOutlinePreview } from "react-icons/md";
import { RotatingLines } from "react-loader-spinner";
import * as FileSaver from "file-saver";
import XLSX from "sheetjs-style";
// eslint-disable-next-line no-unused-vars

import axios from "axios";

const PurchasesReport = () => {
  const Color = {
    background: "rgba(6, 52, 27, 1)",
  };

  const employee = localStorage.getItem("username");
  const [data, setData] = useState([]);
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState("");
  const [duePaid, setDuePaid] = useState("");
  const tableRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [PaymentTypeData, setPaymentTypeData] = useState([]);

  const [searcSupplierName, setSearcSupplierName] = useState("");
  const [date, setDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [invoice, setInvoice] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [entry_by, setEntryBy] = useState("");
  const [shop_name, setShopName] = useState("");
  const [purchase_date, setPurchasedate] = useState("");
  const [total, setTotal] = useState([]);
  const [paid, setPaid] = useState("");
  const [due, setDue] = useState("");
  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [supplierData, setSupplierData] = useState([]);
  const [FiltersupplierData, setFiltersupplierData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [PurchasePage, setPurchasePage] = useState(1);
  const [SupplierNameID, setSupplierNameID] = useState(null);
  const [PurchaseTotalpage, setPurchaseTotalPage] = useState(null);
  const [PurchasePageSize, setPurchasePageSize] = useState(2000);
  const [contributor_name_id, setContributorNameId] = useState("");
  const [paginationVisible, setPaginationVisible] = useState(true);

  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
  });

  const fetchData = useCallback(async (signal) => {
    setIsLoading(true);
    try {
      const response_getPurchaseTranscatioData = await axiosInstance.get(
        `/transactionsRouter/getTransactionWithPagination?operation_type_id=2&page=1&pageSize=2000`,
        { signal }
      );
      const count = response_getPurchaseTranscatioData.data.count;
      setPurchaseTotalPage(Math.ceil(count / PurchasePageSize));
      setIsLoading(false);
    } catch (error) {
      console.log(error.message);
    }
  }, []);

  const handlePurchaseData = useCallback(async (pages) => {
    try {
      const response = await axiosInstance.get(
        `/transactionsRouter/getTransactionWithPagination?operation_type_id=2&page=${pages}&pageSize=${PurchasePageSize}`
      );
      const filterSaleTransactions = response.data.rows;
      setRows((prevRows) => [...prevRows, ...filterSaleTransactions]);
      setPurchasePage((prevPage) => prevPage + 1);
    } catch (error) {
      console.log(error.message);
    }
  }, []);

  const fetchDataPaymentType = async () => {
    try {
      const response = await axiosInstance.get("/paymenttypes/getAll");
      setPaymentTypeData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchSupplierData = async () => {
    try {
      const response = await axiosInstance.get("/contributorname/getAll");
      setSupplierData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  // fetch data
  useEffect(() => {
    document.title = "Supplier Transactions Report";
    const controller = new AbortController();

    fetchDataPaymentType();
    fetchSupplierData();
    fetchData(controller.signal);

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (paginationVisible && PurchasePage <= PurchaseTotalpage) {
      handlePurchaseData(PurchasePage);
    }
  }, [PurchasePage, PurchaseTotalpage, handlePurchaseData, paginationVisible]);

  // filter supplier
  useEffect(() => {
    const filteredContributor = supplierData.filter(
      (contributor) =>
        contributor.ContributorType.contributor_type &&
        contributor.ContributorType.contributor_type === "Supplier"
    );

    setFiltersupplierData(filteredContributor);
  }, [data, supplierData]);

  const handelShowSaleData = () => {
    setRows([]);
    setPurchasePage(1);
    handleResetAll();
    setPaginationVisible(true);
  };
  // reset

  const handleResetAll = () => {
    setActiveRowIndex(null);
    setInvoice("");
    setSupplierName("");
    setAddress("");
    setPurchasedate("");
    setMobile("");
    setEntryBy("");
    setShopName("");
    setTotal("");
    setPaid("");
    setDue("");
    setStartDate("");
    setEndDate("");
    setSearcSupplierName("");
    setDuePaid("");
    setDate("");
  };

  const handleReset = () => {
    setInvoice("");
    setSupplierName("");
    setAddress("");
    setPurchasedate("");
    setMobile("");
    setEntryBy("");
    setShopName("");
    setTotal("");
    setPaid("");
    setDue("");
    setStartDate("");
    setEndDate("");
    setSearcSupplierName("");
    setDuePaid("");
    setDate("");
  };

  // supplier search
  // ==================== Only Date Search=========================

  const handledateSearch = async () => {
    setRows([]);
    try {
      setSearcSupplierName("");
      setStartDate("");
      setEndDate("");
      if (date === "") {
        toast.dismiss();
        toast.warning("Plaese filup Date serach Input");
        return;
      }
      setIsLoading(true);
      setPaginationVisible(false);
      const response = await axiosInstance.get(
        `/transactionsRouter/getTransactionProductOnlyDate?date=${date}&operation_type_id=2`
      );
      if (response.status === 200) {
        const responseData = response.data;
        setRows(responseData);
        setIsLoading(false);
      }
    } catch (error) {
      console.log("Error Form Api From Date To Date");
      setRows([]);
      setIsLoading(false);
    }
  };

  //========================== start date and end date search============================

  const handleSearchDateStartend = async () => {
    setRows([]);
    try {
      setSearcSupplierName("");
      setDate("");

      if (startDate === "" && endDate === "") {
        toast.dismiss();
        toast.warning("Plaese filup Date serach Input");
        return;
      }
      if (startDate === "") {
        toast.dismiss();
        toast.warning("Plaese Fillup From Date Input");
        return;
      }
      if (endDate === "") {
        toast.dismiss();
        toast.warning("Plaese Fillup To Date Input");
        return;
      }
      setIsLoading(true);
      setPaginationVisible(false);
      const response = await axiosInstance.get(
        `/transactionsRouter/getTransactionProductFromDateToDate?startDate=${startDate}&endDate=${endDate}&operation_type_id=2`
      );
      if (response.status === 200) {
        const responseData = response.data;
        setRows(responseData);
        setIsLoading(false);
      }
    } catch (error) {
      console.log("Error Form Api From Date To Date");
      setRows([]);
      setIsLoading(false);
    }
  };
  /// filter invoice
  const formattedTransactions = [
    ...new Set(rows && rows.map((item) => item.invoice_no)),
  ].map((invoiceNo) => {
    // Find the transactions with the current invoice number
    const transactions =
      rows && rows.filter((item) => item.invoice_no === invoiceNo);

    const totalDiscount = transactions.reduce((total, transaction) => {
      // Calculate the item amount for the current transaction
      const itemAmount =
        parseFloat(transaction.quantity_no) *
        parseFloat(transaction.purchase_price);

      // Convert discount percentage to a decimal
      if (transaction.discount > 0) {
        const dsicount =
          itemAmount * (parseFloat(transaction.discount) / 100).toFixed(2);
        const disCountTotal = itemAmount - dsicount;
        return total + disCountTotal;
      } else {
        return total + itemAmount;
      }
    }, 0);
    // Calculate total VAT for the invoice
    const vatAmount = transactions[0].Tax?.rate || 0;
    const totalVATAmount =
      vatAmount === 0 ? 0 : totalDiscount * (parseFloat(vatAmount) / 100);

    const totalvat = Math.round(totalDiscount + totalVATAmount);

    const due = Math.round(totalvat - parseFloat(transactions[0].paid || 0));

    return {
      transaction_id: transactions[0].transaction_id,
      invoice_no: invoiceNo,
      contributor_name: transactions[0]?.ContributorName?.contributor_name,
      mobile: transactions[0]?.ContributorName?.mobile,
      address: transactions[0]?.ContributorName?.address,
      amount: totalvat,
      paid: Math.round(transactions[0].paid || 0),
      due: due,
      date: transactions[0]?.date?.split("T")[0],
      shop_name: transactions[0]?.ShopName?.shop_name,
    };
  });

  /// selected row
  const handlerow = (item, index) => {
    setSelected(item.transaction_id);
    setScrollPosition(tableRef.current.scrollTop);
    setActiveRowIndex(index);
    setInvoice(item.invoice_no);
    setSupplierName(item.contributor_name);
    setAddress(item.address);
    setPurchasedate(item.date.split("T")[0]);
    setMobile(item.mobile);
    setEntryBy(employee);
    setShopName(item.shop_name);
    setTotal(item.amount);
    setPaid(item.paid);
    setDue(item.due);
    const duePaid = (
      parseFloat(
        item.amount !== undefined && item.amount !== null && item.amount !== ""
          ? item.amount
          : 0
      ) -
      parseFloat(
        item.paid !== undefined && item.paid !== null && item.paid !== ""
          ? item.paid
          : 0
      )
    ).toFixed(1);
    setDuePaid(duePaid);
  };
  //Excell
  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";
  const exportToExcel = async (excelData, fileName) => {
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
  };

  //update
  const handleChnage = (name) => {
    if (name) {
      const filter = supplierData.find(
        (item) =>
          item?.contributor_name.trim().toLocaleLowerCase() ===
          name.trim().toLocaleLowerCase()
      );
      console.log(filter?.contributor_name_id);
      setContributorNameId(filter?.contributor_name_id);
    }
  };

  //Customer search

  const handleSearchSupplier = async () => {
    setRows([]);
    setDate("");
    if (!searcSupplierName) {
      toast.warning("Contributor Name Required");

      return;
    }
    setIsLoading(true);
    const respons = await axiosInstance.get(
      `/transactionsRouter/getTransactionByContributorNameId?contributor_name_id=${contributor_name_id}&operation_type_id=2`
    );

    if (respons.status === 200) {
      const responseData = respons.data;
      setRows(responseData);
      console.log(respons.data);
      setIsLoading(false);
      setPaginationVisible(false);
    }
  };
  const handelUpdate = async (event) => {
    if (event.detail > 1) {
      return;
    }

    if (!selected) {
      toast.warning("Please Selected a Row");
      return;
    }

    if (total < parseFloat(paid)) {
      toast.error("Due payment cannot exceed the due amount");
      return;
    }

    try {
      const response = await axiosInstance.put(
        `/transactionsRouter/updateTransactionPaidFromAnyPageByID?transaction_id=${selected}&paid=${paid}`
      );

      if (response.status === 200) {
        toast.success("Successfully Paid.");
        setSelected("");
        const updatedData = rows.map((item) =>
          item.transaction_id === response.data.transaction_id
            ? response.data
            : item
        );
        setRows(updatedData);
        setDuePaid("");
        handleReset();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handelDueUpdate = async (event) => {
    if (event.detail > 1) {
      return;
    }

    if (!selected) {
      toast.warning("Please Selected a Row");
      return;
    }

    const duePayment = parseFloat(paid) + parseFloat(duePaid);

    if (due < parseFloat(duePaid) && parseFloat(duePaid) > 0) {
      toast.error("Due payment cannot exceed the due amount");
      return;
    }
    if (duePaid === 0) {
      toast.warning("Already paid");
      return;
    }

    try {
      const response = await axiosInstance.put(
        `/transactionsRouter/updateTransactionPaidFromAnyPageByID?transaction_id=${selected}&paid=${duePayment}`
      );

      if (response.status === 200) {
        setScrollPosition(tableRef.current.scrollTop);
        toast.success("Successfully Paid.");
        const updatedData = rows.map((item) =>
          item.transaction_id === response.data.transaction_id
            ? response.data
            : item
        );
        setRows(updatedData);
        setSelected("");
        handleReset();
      }
    } catch (error) {
      console.log(error);
    }
  };

  /// get total amount
  const totalAmount =
    formattedTransactions && formattedTransactions.length > 0
      ? formattedTransactions
          .reduce((productamount, item) => {
            if (
              item.amount !== undefined &&
              item.amount !== null &&
              item.amount !== ""
            ) {
              productamount += Number(item.amount);
            }
            return productamount;
          }, 0)
          .toFixed(2)
      : 0;

  // get total paid
  const totalPaid =
    formattedTransactions && formattedTransactions.length > 0
      ? formattedTransactions
          .reduce((productpaid, item) => {
            if (
              item.paid !== undefined &&
              item.paid !== null &&
              item.paid !== ""
            ) {
              productpaid += Number(item.paid);
            }
            return productpaid;
          }, 0)
          .toFixed(2)
      : 0;
  // get total due
  const totalDue = totalAmount - totalPaid;

  useEffect(() => {
    if (tableRef.current !== null) {
      tableRef.current.scrollTo({ top: scrollPosition });
    }
  }, [data, scrollPosition]);

  useEffect(() => {
    const handleChangeSupplier = () => {
      const result = supplierData.find(
        (item) => item.contributor_name === supplierName
      );
      if (result) {
        setSupplierNameID(result.contributor_name_id);
        setAddress(result.address);
        setMobile(result.mobile);
      } else {
        setSupplierNameID("");
        setAddress("");
        setMobile("");
      }
    };
    handleChangeSupplier();
  }, [supplierName, supplierData]);

  return (
    <>
      <div className="full_div">
        <ToastContainer position="top-center" autoClose={1000} />
        <div className="first_row_div_supplier_report">
          <div className="invisible_div_supplier_report">
            <div className="input_field_supplier_report">
              <div className="suppllier_report_input">
                <div className="date_input_field_short_long_purchase_supplier_report">
                  <label className="label_field_supershop_purchase">
                    Date*
                  </label>
                  <input
                    type="date"
                    onChange={(e) => setDate(e.target.value)}
                    value={date}
                  />
                  <button onClick={() => handledateSearch(data)}>Search</button>
                </div>

                <div className="suppllier_report_input ">
                  <div className="input_field_short_long_purchase_supplier_report">
                    <label className="label_field_supershop_purchase">
                      Supplier*
                    </label>
                    <input
                      type="text"
                      onChange={(e) => {
                        setSearcSupplierName(e.target.value);
                        handleChnage(e.target.value);
                      }}
                      list="list_supplier"
                      value={searcSupplierName}
                    />

                    <datalist id="list_supplier">
                      {FiltersupplierData.length > 0 &&
                        FiltersupplierData.map((supplier, index) => {
                          return (
                            <option key={index}>
                              {supplier.contributor_name}
                            </option>
                          );
                        })}
                    </datalist>
                    <button onClick={() => handleSearchSupplier()}>
                      Search
                    </button>
                  </div>
                </div>
              </div>
              <div className="suppllier_report_input_date">
                <div>
                  <div className="date_input_field_short_long_purchase_supplier_report">
                    <label className="label_field_supershop_purchase">
                      From Date*
                    </label>
                    <input
                      type="date"
                      onChange={(e) => setStartDate(e.target.value)}
                      value={startDate}
                    />
                  </div>
                  <div className="suppllier_report_input">
                    <div className="date_input_field_short_long_purchase_supplier_report">
                      <label className="label_field_supershop_purchase">
                        To Date*
                      </label>
                      <input
                        type="date"
                        onChange={(e) => setEndDate(e.target.value)}
                        value={endDate}
                      />
                    </div>
                  </div>
                </div>
                <div className="Supplier_date_search_button">
                  {" "}
                  <button onClick={() => handleSearchDateStartend()}>
                    Search
                  </button>
                </div>
              </div>

              <div className="show_all_suppiler_button">
                <div className="show_all_button">
                  <button onClick={handelShowSaleData}>
                    <MdOutlinePreview style={{ fontSize: "2vw" }} />
                  </button>
                  <span>Show All</span>
                </div>
                <div className="excel_button">
                  <button
                    onClick={() =>
                      exportToExcel(formattedTransactions, "Supplier Report")
                    }
                  >
                    <img src={Excel} alt="" />
                  </button>
                  Excel
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="second_row_div_supplier_report">
          <div className="table_supershop_supplier_report">
            <div
              className={`${
                isLoading ? "loader_spriner" : ""
              } table_div_supershop_supplier_report`}
              ref={tableRef}
            >
              {isLoading ? (
                <RotatingLines
                  strokeColor="grey"
                  strokeWidth="5"
                  animationDuration="0.75"
                  width="64"
                  visible={true}
                />
              ) : (
                <table border={3} cellSpacing={2} cellPadding={10}>
                  <thead>
                    <tr>
                      <th style={Color}>Invoice</th>
                      <th style={Color}>Supplier Name</th>
                      <th style={Color}>Mobile</th>
                      <th style={Color}>Address</th>
                      <th style={Color}>Total</th>
                      <th style={Color}>Paid</th>
                      <th style={Color}>Due</th>
                      <th style={Color}>Purchase Date</th>
                      <th style={Color}>Entry by</th>
                      <th style={Color}>Shop</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formattedTransactions &&
                      formattedTransactions.map((transaction, index) => (
                        <tr
                          key={index}
                          className={
                            activeRowIndex === index ? "active-row" : ""
                          }
                          onClick={() => handlerow(transaction, index)}
                        >
                          <td>{transaction.invoice_no}</td>
                          <td>{transaction.contributor_name}</td>
                          <td>{transaction.mobile}</td>
                          <td>{transaction.address}</td>
                          <td>{transaction.amount}</td>
                          <td>{transaction.paid}</td>
                          <td>{transaction.due}</td>
                          <td>{transaction.date}</td>
                          <td>{employee}</td>
                          <td>{transaction.shop_name}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="total_supplier_report">
              <div className="input_field_short_long_purchase_supplier_report_total">
                <label>Total</label>
                <input
                  type="text"
                  className="input_field_supershop_supplier_long"
                  value={totalAmount}
                  disabled
                />
              </div>
              <div className="input_field_short_long_purchase_supplier_report_total">
                <label>Paid</label>
                <input
                  type="text"
                  className="input_field_supershop_supplier_long"
                  value={totalPaid}
                  disabled
                />
              </div>
              <div className="input_field_short_long_purchase_supplier_report_total">
                <label>Due </label>
                <input
                  type="text"
                  className="input_field_supershop_supplier_long"
                  value={totalDue.toFixed(2)}
                  disabled
                />
              </div>
            </div>
          </div>
        </div>
        <div className="third_row_div_purchase">
          <div className="first_column_second_row_purchase_report">
            <div className="first_column_second_row_input_field_purchase_report">
              <div>
                <div className="input_field_short_long_purchase_supplier_report">
                  <label>Invoice</label>
                  <input
                    type="text"
                    value={invoice}
                    disabled
                    onChange={(event) => setInvoice(event.target.value)}
                  />
                </div>
                <div className="input_field_short_long_purchase_supplier_report">
                  <label>Supplier Name</label>
                  <input
                    type="text"
                    value={supplierName}
                    list="list_supplier_name"
                    disabled
                    onChange={(event) => setSupplierName(event.target.value)}
                  />
                  <datalist id="list_supplier_name">
                    {FiltersupplierData.length > 0 &&
                      FiltersupplierData.map((supplier, index) => {
                        return (
                          <option key={index}>
                            {supplier.contributor_name}
                          </option>
                        );
                      })}
                  </datalist>
                </div>
                <div className="input_field_short_long_purchase_supplier_report">
                  <label>Address</label>
                  <input
                    type="text"
                    value={address}
                    disabled
                    onChange={(event) => setAddress(event.target.value)}
                  />
                </div>
                <div className="input_field_short_long_purchase_supplier_report">
                  <label>Mobile</label>
                  <input
                    type="number"
                    value={mobile}
                    disabled
                    onChange={(event) => setMobile(event.target.value)}
                  />
                </div>
              </div>
              <div>
                <div className="input_field_short_long_purchase_supplier_report">
                  <label>Entry by</label>
                  <input
                    type="text"
                    value={entry_by}
                    disabled
                    onChange={(event) => setEntryBy(event.target.value)}
                  />
                </div>
                <div className="input_field_short_long_purchase_supplier_report">
                  <label>Shop</label>
                  <input
                    type="text"
                    className=" "
                    value={shop_name}
                    disabled
                    onChange={(event) => setShopName(event.target.value)}
                  />
                </div>
                <div className="input_field_short_long_purchase_supplier_report">
                  <label>Purchase Date</label>
                  <input
                    type="text"
                    value={purchase_date}
                    disabled
                    onChange={(event) => setPurchasedate(event.target.value)}
                  />
                </div>
                <div className="input_field_short_long_purchase_supplier_report">
                  <label>Total</label>
                  <input
                    type="text"
                    value={total}
                    disabled
                    onChange={(event) => setTotal(event.target.value)}
                  />
                </div>
              </div>
              <div>
                <div className="input_field_short_long_purchase_supplier_report">
                  <label>Paid</label>
                  <input
                    type="text"
                    value={paid}
                    onChange={(event) => setPaid(event.target.value)}
                  />
                </div>
                <div className="input_field_short_long_purchase_supplier_report">
                  <label>Due</label>
                  <input
                    type="number"
                    value={due}
                    onChange={(event) => setDue(event.target.value)}
                    disabled
                  />
                </div>
              </div>
            </div>
            <div className="all_update_button_supplier_report ">
              <div className="update_button_purchses_report">
                <button onClick={handelUpdate}>
                  <img src={update} alt="" />
                </button>
                Update
              </div>

              <div className="reset_button_purchses_report">
                <button onClick={handleResetAll}>
                  <img src={reset} alt="" />
                </button>
                Reset
              </div>
            </div>
          </div>

          <div className="second_column_second_row_supplier_report">
            <div className="due_payment">Due Payment</div>

            <div className="input_field_short_long_purchase_supplier_report">
              <label>Payment</label>
              <select name="" id="">
                {PaymentTypeData.map((data) => (
                  <option value="">{data.payment_type}</option>
                ))}
              </select>
            </div>
            <div className="input_field_short_long_purchase_supplier_report">
              <label>TK.</label>
              <input
                style={{ width: "12.5vw" }}
                type="text"
                value={duePaid}
                onChange={(event) => setDuePaid(event.target.value)}
              />
            </div>
            <div className="container_div_delete">
              <div className="input_field_short_long_supplier_report">
                <button onClick={handelDueUpdate}>
                  <img src={save} alt="" />
                </button>
                <span>Save</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PurchasesReport;

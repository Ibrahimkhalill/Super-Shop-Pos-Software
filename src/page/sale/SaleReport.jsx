/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef, useCallback } from "react";
import "./salereport.css";
import ExcelExport from "../../components/ExportExcel";
import { MdPreview } from "react-icons/md";
import { RotatingLines } from "react-loader-spinner";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { RxUpdate } from "react-icons/rx";
import { BiReset } from "react-icons/bi";
import { MdDelete } from "react-icons/md";
import { MdLocalPrintshop } from "react-icons/md";
import { useReactToPrint } from "react-to-print";
import { SaleReportPos } from "../../components/SaleReportPos";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";

const SaleReport = () => {
  const [searchProductCode, setSearchProductCode] = useState("");
  const [productName, setProductName] = useState([]);
  const [DateFrom, setDateFrom] = useState([]);
  const [DateTo, setDateTo] = useState([]);
  const [type, setType] = useState([]);
  const [invoice, setInvoice] = useState([]);
  const tableRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const [total, setTotal] = useState("");
  const [product, setProduct] = useState("");
  const [ptype, setPtype] = useState("");
  const [unit, setUnit] = useState("");
  const [onlyDate, setOnlyDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [fixData, setFixData] = useState([]);
  const [code, setCode] = useState("");
  const [shopName, setShopName] = useState("");
  const [distinctProductCode, setDistinctProductCode] = useState([]);
  const [selectedID, setSelectedID] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState("");
  const [buttonVisible, setButtonVisible] = useState(false);
  const [transaction_id, setTranstionId] = useState("");
  const [invoice_no, setInvoiceNo] = useState("");
  const [product_trace_id, setProductTranceId] = useState("");
  const [brand_id, setBardId] = useState("");
  const [quantity_no, setQuantity] = useState("");
  const [unit_id, setUnitId] = useState("");
  const [warranty, setWarranty] = useState("");
  const [tax_id, setTaxId] = useState("");
  const [amount, setAmount] = useState("");
  const [authorized_by_id, setAuthorizedById] = useState("");
  const [contributor_name_id, setContributorNameId] = useState("");
  const [operation_type_id, setOperationTypeId] = useState("");
  const [date, setDate] = useState("");
  const [other_cost, setOtherCost] = useState("");
  const [payment_type_id, setPaymentTypeId] = useState("");
  const [shop_name_id, setShopNameId] = useState("");
  const [paid, setPaid] = useState("");
  const [purchase_price, setPurchasePrice] = useState("");
  const [sale_price, setSalePrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [comment, setComment] = useState("");

  const toastId = React.useRef(null);
  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
  });
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  const [purchaseData, setPurchaseData] = useState([]);
  const [page, setPage] = useState(1);
  const [PurchasePage, setPurchasePage] = useState(1);
  const [pageSize, setPageSize] = useState(500);
  const [PurchasePageSize, setPurchasePageSize] = useState(2000);
  const [Totalpage, setTotalPage] = useState(null);
  const [PurchaseTotalpage, setPurchaseTotalPage] = useState(null);
  const [paginationVisible, setPaginationVisible] = useState(true);

  const fetchData = useCallback(async (signal) => {
    try {
      setIsLoading(true);
      const response_getAllTranscatioData = await axiosInstance.get(
        `/transactionsRouter/getTransactionWithPagination?operation_type_id=1&page=1&pageSize=500`,
        { signal }
      );
      const response_getPurchaseTranscatioData = await axiosInstance.get(
        `/transactionsRouter/getTransactionWithPagination?operation_type_id=2&page=1&pageSize=2000`
      );
      const count = response_getPurchaseTranscatioData.data.count;

      const datas_getAllTranscatioData = response_getAllTranscatioData.data;
      setTotalPage(Math.ceil(datas_getAllTranscatioData.count / pageSize));
      setPurchaseTotalPage(Math.ceil(count / PurchasePageSize));
      const filterSaleTransactions = response_getAllTranscatioData.data.rows;
      setRows(filterSaleTransactions);
      setFixData(...new Set(filterSaleTransactions));
      setIsLoading(false);
      handleReset();
    } catch (error) {
      console.log(error.message);
    }
  }, []);

  const handleClickShowAll = useCallback(async (pages) => {
    console.log(pages);
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(
        `/transactionsRouter/getTransactionWithPagination?operation_type_id=1&page=${pages}&pageSize=${pageSize}`
      );

      const filterSaleTransactions = response.data.rows;
      setRows(filterSaleTransactions);
      setFixData(...new Set(filterSaleTransactions));
      console.log(pages, filterSaleTransactions);
      handleResetAll();
      setIsLoading(false);
    } catch (error) {
      console.log(error.message);
    }
    setButtonVisible(false);
    setSelectedInvoice("");
  }, []);

  const handlePurchaseData = useCallback(async (signal, pages) => {
    try {
      const response = await axiosInstance.get(
        `/transactionsRouter/getTransactionWithPagination?operation_type_id=2&page=${pages}&pageSize=${PurchasePageSize}`,
        { signal }
      );

      const filterSaleTransactions = response.data.rows;
      setPurchaseData((prevRows) => [...prevRows, ...filterSaleTransactions]);
      setPurchasePage((prevPage) => prevPage + 1);
      handleResetAll();
    } catch (error) {
      console.log(error.message);
    }
    setButtonVisible(false);
    setSelectedInvoice("");
  }, []);

  useEffect(() => {
    document.title = "Product Sale Report";
    const controller = new AbortController();

    fetchData(controller.signal);

    return () => {
      controller.abort();
    };

    // eslint-disable-next-lin react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.title = "Product Sale Report";
    const controller = new AbortController();

    if (PurchasePage <= PurchaseTotalpage) {
      handlePurchaseData(controller.signal, PurchasePage);
    }
    return () => {
      controller.abort();
    };

    // eslint-disable-next-lin react-hooks/exhaustive-deps
  }, [PurchasePage, PurchaseTotalpage, handlePurchaseData]);
  // Filter Product

  const ProductCode = () => {
    const fetchData = async () => {
      try {
        const response_getAllPrductCode = await axiosInstance.get(
          "/producttraces/getAll"
        );

        const datas_getAllPrductCode = response_getAllPrductCode.data;

        setDistinctProductCode([...new Set(datas_getAllPrductCode)]);
        console.log(datas_getAllPrductCode);
      } catch (error) {
        console.log(error.message);
      }
    };

    // Call the function
    fetchData();
  };

  useEffect(() => {
    const handleChangeProductCode = () => {
      const result =
        purchaseData &&
        purchaseData.find((item) => item.ProductTrace?.product_code === code);

      if (result) {
        setProductTranceId(result.product_trace_id);
        setProduct(result.ProductTrace?.name);
        setPtype(result.ProductTrace?.type);
        setPurchasePrice(result.purchase_price);
        setUnit(result.Unit?.unit);
        setUnitId(result.Unit?.unit_id);
        setSalePrice(result.sale_price);
      } else {
        setProductTranceId("");
        setProduct("");
        setPtype("");
        setType("");
        setUnit("");
        setUnitId("");
        setPurchasePrice("");
        setSalePrice("");
        setTotal("");
      }
    };
    handleChangeProductCode();
  }, [code]);

  useEffect(() => {
    ProductCode();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //code search
  const handleFilterDataCode = async () => {
    if (searchProductCode === "") {
      toast.warning("BarCode Is Required");
      return;
    }
    setIsLoading(true);
    const response = await axiosInstance.get(
      `/transactionsRouter/getTransactionProductCode?operation_type_id=1&product_code=${searchProductCode}`
    );
    if (response.status === 200) {
      if (response.data.length > 0) {
        const responseData = response.data;
        setRows(responseData);
        setPaginationVisible(false);
        setButtonVisible(true);
        setIsLoading(false);
      } else {
        setRows([]);
        toast.warning("Not Matching Any Data");
        setPaginationVisible(false);
        setButtonVisible(true);
        setIsLoading(false);
      }
    }
  };

  // ==========================product name search=======================
  const handleFilterProduct = async () => {
    try {
      if (!productName || typeof productName !== "string") {
        if (!toast.isActive(toastId.current)) {
          toastId.current = toast.warning("Product Name Is Required");
        }
        return;
      }
      setIsLoading(true);
      const response = await axiosInstance.get(
        `/transactionsRouter/getTransactionProductName?operation_type_id=1&name=${productName}`
      );

      if (response.status === 200) {
        if (response.data.length > 0) {
          const responseData = response.data;
          setRows(responseData);
          setPaginationVisible(false);
          setButtonVisible(true);
          setIsLoading(false);
        } else {
          setRows([]);
          toast.warning("Not Matching Any Data");
          setPaginationVisible(false);
          setButtonVisible(true);
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.log("Product Name Error", error);
    }
  };

  // ===========================Invoice search======================================
  const handleFilterInvoice = async () => {
    try {
      if (!selectedInvoice || typeof selectedInvoice !== "string") {
        if (!toast.isActive(toastId.current)) {
          toastId.current = toast.warning("Invoice Serial Is Required");
        }
        return;
      }
      setIsLoading(true);
      const responce = await axiosInstance.get(
        `/transactionsRouter/getTransactionByInvoiceNo?invoice_no=${selectedInvoice}&operation_type_id=1`
      );
      if (responce.status === 200) {
        if (responce.data.length > 0) {
          const responseData = responce.data;
          setRows(responseData);
          setPaginationVisible(false);
          setButtonVisible(true);
          setIsLoading(false);
        } else {
          setRows([]);
          toast.warning("Not Matching Any Data");
          setPaginationVisible(false);
          setButtonVisible(true);
          setIsLoading(false);
        }
      }
    } catch (error) {}
  };

  // data search

  // =================To Date And From Date Search======================

  // /transactionsRouter/getTransactionProductFromDateToDate?startDate=&endDate=&operation_type_id=
  const handleSearchToDateFromDate = () => {
    const dateToAndFromDate = async () => {
      if (
        !DateFrom ||
        !DateTo ||
        typeof DateFrom !== "string" ||
        typeof DateTo !== "string"
      ) {
        if (!toast.isActive(toastId.current)) {
          toastId.current = toast.warning("Both Date Fields Are Required");
        }
        return;
      }
      setIsLoading(true);
      const response = await axiosInstance.get(
        `/transactionsRouter/getTransactionProductFromDateToDate?startDate=${DateFrom}&endDate=${DateTo}&operation_type_id=1`
      );
      if (response.status === 200) {
        if (response.data.length > 0) {
          const responseData = response.data;
          setRows(responseData);
          setPaginationVisible(false);
          setButtonVisible(true);
          setIsLoading(false);
        } else {
          setRows([]);
          toast.warning("Not Matching Any Data");
          setPaginationVisible(false);
          setButtonVisible(true);
          setIsLoading(false);
        }
      }
    };

    dateToAndFromDate();
  };

  // ================== Single Date Search=========================
  const handleFilterOnlyDate = async () => {
    try {
      if (!onlyDate) {
        if (!toast.isActive(toastId.current)) {
          toastId.current = toast.warning("Date Is Required");
        }
        return;
      }
      setIsLoading(true);
      const response = await axiosInstance.get(
        `/transactionsRouter/getTransactionProductOnlyDate?date=${onlyDate}&operation_type_id=1`
      );
      if (response.status === 200) {
        if (response.data.length > 0) {
          const responseData = response.data;
          if (searchProductCode !== "") {
            const filter = responseData.filter(
              (data) => data.ProductTrace?.product_code === searchProductCode
            );
            setRows(filter);
            toast.warning("Not Matching Any Data");
            setPaginationVisible(false);
            setButtonVisible(true);
            setIsLoading(false);
          } else {
            setRows(responseData);
            setPaginationVisible(false);
            setButtonVisible(true);
            setIsLoading(false);
          }
        } else {
          setRows([]);
          toast.warning("Not Matching Any Data");
          setPaginationVisible(false);
          setButtonVisible(true);
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.log("Date api Error", error);
    }
  };
  // data search

  const handelShowSaleData = () => {
    setPage(1);
    setPaginationVisible(true);
    handleClickShowAll(1);
    setProductName("");
    setDateFrom("");
    setDateTo("");
    setType("");
    setSearchProductCode("");
  };

  const totalQuantity =
    rows && rows.length > 0
      ? rows
          .reduce((productamount, item) => {
            if (
              item.quantity_no !== undefined &&
              item.quantity_no !== null &&
              item.quantity_no !== "" &&
              !isNaN(item.quantity_no)
            ) {
              productamount += Number(item.quantity_no);
            } else {
              console.log("Invalid quantity_no:", item.quantity_no); // Log invalid quantity_no values
            }
            return productamount;
          }, 0)
          .toFixed(2)
      : "0.00";

  const UpdateAllData = async (event) => {
    if (event.detail > 1) {
      return;
    }

    if (!transaction_id) {
      toast.warning("Please Selected A Row.");
      return;
    }

    const updatedata = {
      transaction_id: transaction_id,
      invoice_no: invoice_no,
      product_trace_id: product_trace_id,
      quantity_no: quantity_no,
      unit_id: unit_id,
      brand_id: brand_id || null,
      warranty: warranty,
      tax_id: tax_id || 0,
      amount: amount,
      authorized_by_id: authorized_by_id,
      contributor_name_id: contributor_name_id || null,
      operation_type_id: operation_type_id || null,
      date: date,
      payment_type_id: payment_type_id || null,
      paid: paid || 0,
      purchase_price: purchase_price,
      sale_price: sale_price,
      discount: discount,
      shop_name_id: shop_name_id,
      other_cost: other_cost,
      comment: comment,
    };
    try {
      const response = await axiosInstance.put(
        "/transactionsRouter/updateTransactionAllFromAnyPageByID",
        updatedata
      );
      if (response.status === 200) {
        toast.success("Successfully Product Sale Updateded.");
        setScrollPosition(tableRef.current.scrollTop);
        const updatedData = rows.map((item) =>
          item.transaction_id === response.data.transaction_id
            ? response.data
            : item
        );
        setRows(updatedData);
        handleReset();
        setButtonVisible(false);
      }
    } catch (error) {
      console.log("Problem Found", error);
    }
  };

  const handleReset = () => {
    setCode("");
    setProduct("");
    setPtype("");
    setUnit("");
    setQuantity("");
    setTotal("");
    setWarranty("");
    setDate("");
    setSalePrice("");
    setShopName("");
  };

  const handleResetAll = () => {
    setSelectedID(null);
    setTranstionId("");
    setCode("");
    setProduct("");
    setPtype("");
    setUnit("");
    setQuantity("");
    setTotal("");
    setWarranty("");
    setDate("");
    setSalePrice("");
    setShopName("");
    setProductName("");
    setDateFrom("");
    setDateTo("");
    setOnlyDate("");
    setType("");
    setSearchProductCode("");
    setSelectedInvoice("");
  };
  useEffect(() => {
    if (quantity_no !== "" && sale_price !== "") {
      const total = (parseFloat(quantity_no) * parseFloat(sale_price)).toFixed(
        1
      );
      setTotal(total || 0);
    }
  }, [quantity_no, sale_price]);

  const hendleDataInputField = (item) => {
    setScrollPosition(tableRef.current.scrollTop);
    setSelectedID(item.transaction_id);
    setTranstionId(item.transaction_id);
    setInvoiceNo(item.invoice_no);
    setProductTranceId(item.product_trace_id);
    setBardId(brand_id);
    setCode(item.ProductTrace ? item.ProductTrace.product_code : "");
    setProduct(item.ProductTrace ? item.ProductTrace.name : "");
    setPtype(item.ProductTrace ? item.ProductTrace.type : "");
    setUnit(item.Unit ? item.Unit.unit : "");
    setUnitId(item.unit_id);
    setQuantity(item.quantity_no);
    setTaxId(item.tax_id);
    setAuthorizedById(item.authorized_by_id);
    setContributorNameId(item.contributor_name_id);
    setOperationTypeId(item.operation_type_id);
    setOtherCost(item.other_cost);
    setPaymentTypeId(item.payment_type_id);
    setShopNameId(item.shop_name_id);
    setTotal(
      (
        parseFloat(item.sale_price || 0) *
        parseFloat(item.quantity_no || 0) *
        (1 - parseFloat(item.discount || 0) / 100)
      ).toFixed(1)
    );

    setAmount(item.amount);
    setPaid(item.paid);
    setPurchasePrice(item.purchase_price);
    setDiscount(item.discount);
    setWarranty(item.warranty);
    setComment(item.comment);
    setDate(item.date ? item.date.split("T")[0] : "");
    setSalePrice(item.sale_price);
    setShopName(item.ShopName ? item.ShopName.shop_name : "");
  };

  const totalAmount =
    rows && rows.length > 0
      ? rows
          .reduce((total, item) => {
            const amount = parseFloat(item.sale_price) || 0;
            const qunatity = parseFloat(item.quantity_no) || 0;
            const discount = 1 - parseFloat(item.discount || 0) / 100;
            const itemTotal = amount * qunatity * discount;
            total += itemTotal;
            return total;
          }, 0)
          .toFixed(2)
      : 0;

  // const dateAquire = rows && rows.length > 0;
  const dateAquire =
    rows && rows.length > 0 ? rows[0].date.split("T")[0] : null;

  const VAT =
    rows && rows.length > 0 ? (rows[0].vat !== undefined ? rows[0].vat : 0) : 0;
  const discounts =
    rows && rows.length > 0
      ? rows[0].discount !== undefined
        ? rows[0].discount
        : 0
      : 0;

  const invoiceNumber = rows && rows.length > 0 ? rows[0].invoice_no : null;
  //========= deleteTransection================

  //calculate scroll postion

  useEffect(() => {
    if (tableRef.current !== null) {
      tableRef.current.scrollTo({ top: scrollPosition });
    }
  }, [fixData, scrollPosition]);

  const handlePageChange = (newPage) => {
    // Scroll to the top of the page with smooth behavior
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Set the new current page
    setPage(newPage);
    handleClickShowAll(newPage);
    // Fetch and update the content based on the new page
    // fetchContent(newPage);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    buttons.push(
      <button
        className="arrow"
        key="prev"
        onClick={(e) => {
          e.preventDefault();
          handlePageChange(page - 1);
        }}
        disabled={page === 1}
      >
        <IoIosArrowBack />
      </button>
    );

    // Display ellipsis before current page and after current page
    const displayEllipsis = (start, end) => {
      for (let i = start; i <= end; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={page === i ? "active" : ""}
          >
            {i}
          </button>
        );
      }
    };

    if (Totalpage <= 7) {
      // If total pages are 7 or less, display all pages
      displayEllipsis(1, Totalpage);
    } else {
      // Display pages based on current page
      if (page <= 4) {
        displayEllipsis(1, 5);
        buttons.push(<span key="ellipsis1">... </span>);
        displayEllipsis(Totalpage - 1, Totalpage);
      } else if (page >= Totalpage - 3) {
        displayEllipsis(1, 2);
        buttons.push(<span key="ellipsis2">... </span>);
        displayEllipsis(Totalpage - 4, Totalpage);
      } else {
        displayEllipsis(1, 2);
        buttons.push(<span key="ellipsis3">... </span>);
        displayEllipsis(page - 1, page + 1);
        buttons.push(<span key="ellipsis4">... </span>);
        displayEllipsis(Totalpage - 1, Totalpage);
      }
    }

    buttons.push(
      <button
        className="arrow"
        key="next"
        onClick={(e) => {
          e.preventDefault();
          handlePageChange(page + 1);
        }}
        disabled={page === Totalpage}
      >
        <IoIosArrowForward />
      </button>
    );

    return buttons;
  };

  return (
    <div className="full_div_supershop_sale_report">
      <ToastContainer stacked autoClose={500} />
      <div className="first_row_div_supershop_sale_report">
        <div className="container_supershop_sale_report">
          <div className="container_supershop_sale_report_column1">
            <div>
              <div className="input_field_supershop_sale_report">
                <label>From Date</label>
                <input
                  type="date"
                  onChange={(e) => setDateFrom(e.target.value)}
                  value={DateFrom}
                />
              </div>

              <div className="input_field_supershop_sale_report">
                <label>To Date</label>
                <input
                  type="date"
                  onChange={(e) => setDateTo(e.target.value)}
                  value={DateTo}
                />
              </div>
            </div>
            <div className="input_field_supershop_sale_report">
              <button onClick={handleSearchToDateFromDate}>Search</button>
            </div>
          </div>
          <div className="container_supershop_sale_report_column2">
            <div className="input_field_supershop_sale_report">
              <label>Porduct</label>
              <input
                onChange={(e) => setProductName(e.target.value)}
                value={productName}
                list="product"
              />
              <datalist id="product">
                {distinctProductCode.length > 0 &&
                  distinctProductCode.map((items, index) => {
                    return <option key={index}>{items.name}</option>;
                  })}
              </datalist>
              <button onClick={handleFilterProduct}>Search</button>
            </div>

            <div className="input_field_supershop_sale_report">
              <label>Invoice</label>
              <input
                onChange={(e) => setSelectedInvoice(e.target.value)}
                value={selectedInvoice}
                list="invoice"
              />
              <datalist id="invoice">
                {[...new Set(purchaseData.map((item) => item.invoice_no))].map(
                  (invoice, index) => (
                    <option key={index}>{invoice}</option>
                  )
                )}
              </datalist>
              <button onClick={handleFilterInvoice}>Search</button>
            </div>
          </div>
          <div className="container_supershop_sale_report_column3">
            <div className="input_field_supershop_sale_report">
              <label>Date</label>
              <input
                type="date"
                onChange={(e) => setOnlyDate(e.target.value)}
                value={onlyDate}
              />
              <button onClick={handleFilterOnlyDate}>Search</button>
            </div>
            <div className="input_field_supershop_sale_report">
              <label>BarCode</label>
              <input
                value={searchProductCode}
                onChange={(event) => setSearchProductCode(event.target.value)}
                list="barcode"
              />
              <datalist autoComplete="off" id="barcode" >
                {distinctProductCode.length > 0 &&
                  distinctProductCode.map((items, index) => {
                    return <option key={index}>{items.product_code}</option>;
                  })}
              </datalist>

              <button onClick={handleFilterDataCode}>Search</button>
            </div>
          </div>
          <div className="container_supershop_sale_report_column4">
            <div className="container_sheet_button_sale_report">
              <button onClick={handelShowSaleData}>
                <MdPreview />
              </button>
              <span>Show All</span>
            </div>
            <div>
              <ExcelExport />
            </div>
          </div>
        </div>
      </div>
      <div className="second_row_div_supershop_sale_report">
        {isLoading ? (
          <div className="loading">
            <RotatingLines
              strokeColor="grey"
              strokeWidth="5"
              animationDuration="0.75"
              width="64"
              visible={true}
            />
          </div>
        ) : (
          <>
            <div
              className="container_table_supershop_sale_report"
              ref={tableRef}
            >
              <table>
                <tr>
                  <th>Invoice No</th>
                  <th>BarCode</th>
                  <th>Product Name</th>
                  <th>Product Type</th>
                  <th>Sale Price</th>
                  <th>Quantity</th>
                  <th>Discount</th>
                  <th>Item Total</th>
                  <th>Sale Date</th>
                  <th>Unit</th>
                  <th>Shop Name</th>
                </tr>
                <tbody>
                  {rows.length > 0 &&
                    rows.map((item) => (
                      <tr
                        key={item.transaction_id}
                        onClick={() => hendleDataInputField(item)}
                        className={
                          selectedID === item.transaction_id
                            ? "rows selected"
                            : "rows"
                        }
                        tabindex="0"
                      >
                        <td>{item.invoice_no}</td>

                        <td>
                          {item.ProductTrace
                            ? item.ProductTrace.product_code
                            : ""}
                        </td>
                        <td>
                          {item.ProductTrace ? item.ProductTrace.name : ""}
                        </td>
                        <td>
                          {item.ProductTrace ? item.ProductTrace.type : ""}
                        </td>
                        <td>{item.sale_price}</td>
                        <td>{item.quantity_no}</td>
                        <td>{item.discount}%</td>
                        <td>
                          {(
                            parseFloat(item.sale_price || 0) *
                            parseFloat(item.quantity_no || 0) *
                            (1 - parseFloat(item.discount || 0) / 100)
                          ).toFixed(1)}
                        </td>
                        <td className="hover-effect">
                          {item.date ? item.date.split("T")[0] : ""}
                        </td>
                        <td className="hover-effect">
                          {item.Unit ? item.Unit.unit : ""}
                        </td>
                        <td className="hover-effect">
                          {item.ShopName ? item.ShopName.shop_name : ""}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {paginationVisible && (
              <div className="pagination-buttons">
                {renderPaginationButtons()}
              </div>
            )}
          </>
        )}
      </div>
      <div className="third_row_div_supershop_sale_report">
        <div className="conatiner_update_supershop_sale_report_column1">
          <div className="input_field_supershop_sale_report">
            <label>BarCode</label>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              list="code"
            />
            <datalist id="code">
              {purchaseData.length > 0 && (
                <>
                  {[
                    ...new Set(
                      purchaseData.map(
                        (item) => item.ProductTrace?.product_code
                      )
                    ),
                  ].map((productCode, index) => (
                    <option key={index}>{productCode}</option>
                  ))}
                </>
              )}
            </datalist>
          </div>
          <div className="input_field_supershop_sale_report">
            <label>Product Name</label>
            <input
              value={product}
              onChange={(event) => setProduct(event.target.value)}
            />
          </div>
          <div className="input_field_supershop_sale_report">
            <label>Product Type</label>
            <input
              value={ptype}
              onChange={(event) => setPtype(event.target.value)}
            />
          </div>
        </div>
        <div className="conatiner_update_supershop_sale_report_column2">
          <div className="input_field_supershop_sale_report">
            <label>Sale Price</label>
            <input
              type="number"
              value={sale_price}
              onChange={(event) => setSalePrice(event.target.value)}
            />
          </div>
          <div className="input_field_supershop_sale_report">
            <label>Quantity</label>
            <input
              type="number"
              value={quantity_no}
              onChange={(event) => setQuantity(event.target.value)}
            />
          </div>
          <div className="input_field_supershop_sale_report">
            <label>Item Total</label>
            <input
              value={total}
              onChange={(event) => setTotal(event.target.value)}
              disabled
            />
          </div>
        </div>
        <div className="conatiner_update_supershop_sale_report_column3">
          <div className="input_field_supershop_sale_report">
            <label>Unit</label>
            <input
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            />
          </div>
          <div className="input_field_supershop_sale_report">
            <label>Sale Date</label>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>

          <div className="input_field_supershop_sale_report">
            <label>Shop Name</label>
            <input
              value={shopName}
              onChange={(event) => setShopName(event.target.value)}
            />
          </div>
        </div>
        <div className="conatiner_update_supershop_sale_report_column4">
          <div className="container_sheet_button_sale_report">
            <button onClick={handleResetAll}>
              <BiReset />
            </button>
            <span>Reset</span>
          </div>
          {buttonVisible && (
            <div>
              <div style={{ display: "none" }}>
                <SaleReportPos
                  ref={componentRef}
                  discount={discounts}
                  VAT={VAT}
                  dateAquire={dateAquire}
                  rows={rows}
                  totalAmount={totalAmount}
                  invoiceNumber={invoiceNumber}
                  // paid={paid}
                />
              </div>
              <div className="container_sheet_button_sale_report">
                <button onClick={handlePrint}>
                  <MdLocalPrintshop />
                </button>
                <span>Invoice</span>
              </div>
            </div>
          )}
          <div className="container_sheet_button_sale_report">
            <button onClick={UpdateAllData}>
              <RxUpdate />
            </button>
            <span>Update</span>
          </div>
        </div>

        <div className="conatiner_update_supershop_sale_report_column5">
          <div className="input_field_supershop_sale_report">
            <label style={{ justifyContent: "center" }}>Total Qnantity</label>
            <input
              style={{
                width: "11vw",
                marginRight: "1vw",
                fontSize: "1vw",
                textAlign: "center",
                fontWeight: "bold",
              }}
              value={totalQuantity}
            />
          </div>
          <div className="input_field_supershop_sale_report">
            <label style={{ justifyContent: "center" }}>Total Sale</label>
            <input
              style={{
                width: "11vw",
                marginRight: "1vw",
                fontSize: "1vw",
                textAlign: "center",
                fontWeight: "bold",
              }}
              value={totalAmount}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleReport;

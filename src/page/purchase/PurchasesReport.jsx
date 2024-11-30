/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef, useCallback } from "react";
import "./purchases_report.css";
import update from "../../image/Update.png";
import invoiceimg from "../../image/Invoice.png";
import reset from "../../image/reset.png";
import Excel from "../../image/excel.webp";
import { RotatingLines } from "react-loader-spinner";
import { ToastContainer, toast } from "react-toastify";
import { MdOutlinePreview } from "react-icons/md";

import * as FileSaver from "file-saver";
// import { useReactToPrint } from 'react-to-print';
import { MdDelete } from "react-icons/md";
import Delete from "../../image/delete.png";
import { ComponentToPrint } from "../../components/GenaratePdf";
import XLSX from "sheetjs-style";
import axios from "axios";
const PurchasesReport = () => {
  const Color = {
    background: "rgba(6, 52, 27, 1)",
  };
  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
  });
  const tableRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [data, setData] = useState([]);
  const [rows, setRows] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState("");
  const [unitData, setUnitData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [TotalAmount, setTotalAmount] = useState(0);

  const [searcProductName, setSearchProductName] = useState("");
  const [searcProductCode, setSearchProductCode] = useState("");
  const [Searchcategory, setSearchcategory] = useState("");
  const [supplierData, setSupplierData] = useState([]);
  const [searchSupplier, setSearchSupplier] = useState("");
  const [paginationVisible, setPaginationVisible] = useState(true);

  const [product_code, setProductCode] = useState("");
  const [product_trace_id, setProductTraceId] = useState("");
  const [product_name, setProductName] = useState("");
  const [product_type, setProductType] = useState("");
  const [purchase_price, setPurchasePrice] = useState("");
  const [purchase_date, setPurchasedate] = useState("");
  const [shop_name, setShopName] = useState("");
  const [sale_price, setSalePrice] = useState([]);
  const [qunatity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [unitId, setUnitId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [paid, setPaid] = useState("");
  const [contributor_name, setContributorName] = useState("");
  const [category, setCategory] = useState("");
  const [total, setTotal] = useState("");
  const [productdata, setProductData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeRowIndex, setActiveRowIndex] = useState(false);
  const [discount, setDiscount] = useState("");
  const [payment_id, setPaymentId] = useState("");
  const [prevDate, SetPrevDate] = useState("");
  const [PurchasePage, setPurchasePage] = useState(1);
  const [PurchasePageSize, setPurchasePageSize] = useState(2000);
  const [PurchaseTotalpage, setPurchaseTotalPage] = useState(null);
  // const [netotal, setNetTotal] = useState("")
  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";
  const exportToExcel = async (excelData, fileName) => {
    console.log(excelData);
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, fileName + fileExtension);
  };

  useEffect(() => {
    if (tableRef.current !== null) {
      tableRef.current.scrollTo({ top: scrollPosition });
    }
  }, [data, scrollPosition]);
  const fetchData = useCallback(async (signal) => {
    setLoading(true);
    try {
      const response_getPurchaseTranscatioData = await axiosInstance.get(
        `/transactionsRouter/getTransactionWithPagination?operation_type_id=2&page=1&pageSize=2000`,
        { signal }
      );
      const count = response_getPurchaseTranscatioData.data.count;
      setPurchaseTotalPage(Math.ceil(count / PurchasePageSize));
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
      setLoading(false);
    } catch (error) {
      console.log(error.message);
    }
  }, []);

  useEffect(() => {
    document.title = "Product Purchase Report";
    const controller = new AbortController();
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

  const handelShowData = () => {
    setRows([]);
    setPurchasePage(1);
    handleResetAll();
    setPaginationVisible(true);
  };

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await axiosInstance.get("/producttraces/getAll");
        setProductData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    const fetchDataUnit = async () => {
      try {
        const response = await axiosInstance.get("/unit/getAll");
        setUnitData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    const fetchAllCategory = async () => {
      try {
        const { data } = await axiosInstance.get("/category/getAll");
        setCategories(data);
      } catch (error) {
        console.log(error);
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
    fetchProductData();
    fetchDataUnit();
    fetchAllCategory();
    fetchSupplierData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [transaction_id, setTranscation] = useState([]);
  const [transactionId, setTransectionID] = useState("");

  const handlerow = (item, index) => {
    setTransectionID(item.transaction_id);

    // setTranscation(item.transaction_id);
    setScrollPosition(tableRef.current.scrollTop);

    setQuantity(item.quantity_no);
    SetPrevDate(item.date);
    setPurchasedate(item.date);
    setSalePrice(item.sale_price);
    setPurchasePrice(item.purchase_price);
    setProductCode(item.ProductTrace?.product_code);
    setProductName(item.ProductTrace?.name);
    setProductType(item.ProductTrace?.type);
    setShopName(item.ShopName?.shop_name);
    setProductTraceId(item.ProductTrace?.product_trace_id);
    setCategory(item.ProductTrace?.Category?.category_name);
    setUnit(item.Unit?.unit);
    setDiscount(item.discount);
    setBrandId(item.Brand?.brand_id);
    setContributorName(item.ContributorName?.contributor_name_id);
    setPaymentId(item.PaymentType?.payment_type_id);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  // ====================Product Name Search===========================

  const handleSearch = async () => {
    try {
      setSearchProductCode("");
      setSearchcategory("");
      setDate("");
      setStartDate("");
      setEndDate("");
      if (searcProductName === "") {
        toast.dismiss();
        toast.warning("Plaese Fillup serach Input");
        return;
      }
      setLoading(true);
      setPaginationVisible(false);

      const response = await axiosInstance.get(
        `/transactionsRouter/getTransactionProductName?operation_type_id=2&name=${searcProductName}`
      );

      if (response.status === 200) {
        const responseData = response.data;
        setRows(responseData);
        setLoading(false);
      } else {
        setRows([]);
        setLoading(false);
      }
    } catch (error) {
      console.log("Product Name Error", error);
      setLoading(false);
      setRows([]);
    }
  };

  // ====================Product Code Search===========================

  const handleSearchproductcode = async () => {
    try {
      setSearchProductName("");
      setSearchcategory("");
      setDate("");
      setStartDate("");
      setEndDate("");
      if (searcProductCode === "") {
        toast.dismiss();
        toast.warning("Plaese Fillup serach Input");
        return;
      }
      setLoading(true);
      setPaginationVisible(false);

      const response = await axiosInstance.get(
        `/transactionsRouter/getTransactionProductCode?operation_type_id=2&product_code=${searcProductCode}`
      );
      if (response.status === 200) {
        const responseData = response.data;
        if (responseData.length === 0) {
          setRows([]);
          setLoading(false);
        } else {
          setRows(responseData);
          setLoading(false);
        }
      } else {
        setRows([]);
        setLoading(false);
      }
    } catch (error) {
      console.log("Product Code Error", error);
      setLoading(false);
      setRows([]);
    }
  };

  // ====================Product Cetagory Search===========================

  const handleSearchcategory = async () => {
    try {
      setSearchProductName("");
      setSearchProductCode("");
      setDate("");
      setStartDate("");
      setEndDate("");
      if (Searchcategory === "") {
        toast.dismiss();
        toast.warning("Plaese Fillup serach Input");
        return;
      }
      setLoading(true);
      setPaginationVisible(false);

      const response = await axiosInstance.get(
        `/transactionsRouter/getTransactionProductCategory?operation_type_id=2&category_name=${Searchcategory}`
      );
      if (response.status === 200) {
        const responseData = response.data;
        if (responseData.length === 0) {
          setRows([]);
          setLoading(false);
        } else {
          setRows(responseData);
          setLoading(false);
        }
      } else {
        setRows([]);
        setLoading(false);
      }
    } catch (error) {
      console.log("Category Name Error", error);
      setLoading(false);
      setRows([]);
    }
  };

  // =========================To Date From Date Search=============================

  const handleSearchDateStartend = async () => {
    setRows([]);
    try {
      setSearchProductName("");
      setSearchcategory("");
      setDate("");
      setSearchProductCode("");
      if (startDate === "" && endDate === "") {
        toast.dismiss();
        toast.warning("Please fill up the date input.");
        return;
      }
      if (startDate === "") {
        toast.dismiss();
        toast.warning("Please fill up start date input.");
        return;
      }
      if (endDate === "") {
        toast.dismiss();
        toast.warning("Please fill up end date input");
        return;
      }
      setLoading(true);
      setPaginationVisible(false);

      const response = await axiosInstance.get(
        `/transactionsRouter/getTransactionProductFromDateToDate?startDate=${startDate}&endDate=${endDate}&operation_type_id=2`
      );
      if (response.status === 200) {
        const responseData = response.data;
        if (responseData.length === 0) {
          setRows([]);
          setLoading(false);
        } else {
          setRows(responseData);
          setLoading(false);
        }
      } else {
        setRows([]);
        setLoading(false);
      }
    } catch (error) {
      console.log("Date search Error", error);
      setLoading(false);
    }
  };

  // ===========================Only Date Search===========================

  const handledateSearch = async () => {
    try {
      setSearchProductName("");
      setSearchcategory("");
      setStartDate("");
      setEndDate("");
      setSearchProductCode("");
      if (date === "") {
        toast.dismiss();
        toast.warning("Please fill up the search input");
        return;
      }
      setLoading(true);
      setPaginationVisible(false);

      const response = await axiosInstance.get(
        `/transactionsRouter/getTransactionProductOnlyDate?date=${date}&operation_type_id=2`
      );
      if (response.status === 200) {
        const responseData = response.data;
        if (responseData.length === 0) {
          setRows([]);
          setLoading(false);
        } else {
          setRows(responseData);
          setLoading(false);
        }
      } else {
        setRows([]);
        setLoading(false);
      }
    } catch (error) {
      console.log("Date search Error", error);
      setLoading(false);
    }
  };
  const handleSearchSupplier = async (e) => {
    e.preventDefault();

    if (!searchSupplier) {
      toast.dismiss();
      toast.warning("Supplier Required");
      return;
    }
    const filter = supplierData.find(
      (item) =>
        item?.contributor_name.trim().toLocaleLowerCase() ===
        searchSupplier.trim().toLocaleLowerCase()
    );
    const contributor_name_id = filter?.contributor_name_id || null;
    setLoading(true);
    setPaginationVisible(false);

    const response = await axiosInstance.get(
      `/transactionsRouter/getTransactionByContributorNameId?contributor_name_id=${contributor_name_id}&operation_type_id=2`
    );

    if (response.status === 200) {
      const responseData = response.data;
      if (responseData.length === 0) {
        setRows([]);
        setLoading(false);
      } else {
        setRows(responseData);
        setLoading(false);
      }
    } else {
      setRows([]);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setQuantity("");
    setDiscount("");
    setPurchasedate("");
    setSalePrice("");
    setPurchasePrice("");
    setProductCode("");
    setProductName("");
    setProductType("");
    setShopName("");
    setTotal("");
    setCategory("");
    setUnit("");
  };

  const handleResetAll = () => {
    setTransectionID("");
    setTranscation([]);
    setScrollPosition(0);
    setSearchProductCode("");
    setSearchProductName("");
    setStartDate("");
    setEndDate("");
    setDate("");
    setSearchcategory("");
    setQuantity("");
    setDiscount("");
    setPurchasedate("");
    setSalePrice("");
    setPurchasePrice("");
    setProductCode("");
    setProductName("");
    setProductType("");
    setShopName("");
    setTotal("");
    setCategory("");
    setUnit("");
    setActiveRowIndex(null);
    setSearchSupplier("");
  };

  // useEffect(() => {
  //   if (tableRef.current !== null) {
  //     tableRef.current.scrollTo({ top: scrollPosition });
  //   }
  // }, [scrollPosition]);

  useEffect(() => {
    if (rows && rows.length > 0) {
      const total = rows.reduce((accumulator, item) => {
        const itemTotal =
          parseFloat(item.quantity_no) *
          parseFloat(item.purchase_price) *
          (1 - parseFloat(item.discount) / 100);
        return accumulator + itemTotal;
      }, 0);
      setTotalAmount(parseFloat(total, 10));
      console.log(total);
    } else {
      setTotalAmount(0);
    }
  }, [rows]);

  const calculateTotalWithDiscount = (price, quantity, discountPercentage) => {
    // Convert price and quantity to integers
    const parsedPrice = parseFloat(price);
    const parsedQuantity = parseFloat(quantity);

    // Calculate the total without discount
    const totalWithoutDiscount = parsedPrice * parsedQuantity;

    // Calculate the discount amount
    const discountAmount = (totalWithoutDiscount * discountPercentage) / 100;

    // Calculate the total after applying the discount
    const totalWithDiscount = totalWithoutDiscount - discountAmount;

    return totalWithDiscount.toFixed(1) || "";
  };
  const today = new Date();
  const hours = String(today.getHours()).padStart(2, "0");
  const minutes = String(today.getMinutes()).padStart(2, "0");
  const seconds = String(today.getSeconds()).padStart(2, "0");

  const formattedDateTime =
    prevDate === purchase_date
      ? purchase_date
      : `${purchase_date} ${hours}:${minutes}:${seconds}`;

  const handleUpdate = async (event) => {
    if (event.detail > 1) {
      return;
    }
    if (!transactionId) {
      toast.warning("Please Select a Row");
      return;
    }
    const newTransactions = {
      transaction_id: transactionId,
      product_trace_id: product_trace_id,
      quantity_no: qunatity,
      brand_id: brandId || null,
      unit_id: unitId,
      authorized_by_id: 1,
      contributor_name_id: contributor_name || null,
      operation_type_id: 2,
      payment_type_id: payment_id || null,
      paid: paid || 0,
      purchase_price: purchase_price,
      sale_price: sale_price,
      discount: discount,
      shop_name_id: 1,
      date: formattedDateTime || purchase_date,
    };

    try {
      const response = await axiosInstance.put(
        "/transactionsRouter/updateTransactionAllFromAnyPageByID",
        newTransactions,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        setScrollPosition(tableRef.current.scrollTop);
        toast.success("Successfully Purchase Updateded.");

        const updatedData = rows.map((item) =>
          item.transaction_id === response.data.transaction_id
            ? response.data
            : item
        );
        setRows(updatedData);

        console.log(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (discount > 0) {
      setTotal(
        Math.floor(
          calculateTotalWithDiscount(purchase_price, qunatity, discount)
        ).toFixed(2)
      );
    } else {
      setTotal(
        (parseFloat(purchase_price) * parseFloat(qunatity) || 0).toFixed(1) ||
          ""
      );
    }
  }, [discount, purchase_price, qunatity]);

  const newDataArray =
    rows.length > 0 &&
    rows.map((row) => ({
      category_name: row.ProductTrace?.Category?.category_name || "",
      product_code: row.ProductTrace?.product_code || "",
      name: row.ProductTrace?.name || "",
      type: row.ProductTrace?.type || "",
      brand_name: row.Brand?.brand_name || "",
      quantity_no: row.quantity_no || "",
      unit: row.Unit?.unit || "",
      purchase_price: row.purchase_price || "",
      discount: row.discount || "",
      total:
        row.discount > 0
          ? Math.floor(
              calculateTotalWithDiscount(
                row.purchase_price,
                row.quantity_no,
                row.discount
              )
            )
          : parseFloat(row.purchase_price) * parseFloat(row.quantity_no),
      sale_price: row.sale_price || "",
      date: row.date ? row.date.split("T")[0] : "",
      shop_name: row.ShopName?.shop_name || "",
    }));

  const deleteTransection = async (event) => {
    if (!activeRowIndex) {
      setActiveRowIndex(true);
      toast.warning("Please select at least one row to delete!");
      return;
    }
    if (event.detail > 1) {
      return;
    }
    try {
      if (!transaction_id) {
        //toast message:
        toast.error("Please select at least one row to delete!");
      } else {
        const confirmDelete = window.confirm(
          "Are you sure you want to delete the selected rows?"
        );
        if (confirmDelete) {
          // Convert transaction_id to an array if it's not already an array
          const transactionIds = Array.isArray(transaction_id)
            ? transaction_id
            : [transaction_id];

          // Iterate over the array of transaction IDs and delete each one
          for (const id of transactionIds) {
            const response = await axiosInstance.delete(
              `/transactionsRouter/deleteTransactionByID?transaction_id=${id}`
            );
            if (response.status === 200) {
              toast.dismiss();
              toast.success(`Successfully deleted transaction with ID ${id}`);
              const updatedData = rows.filter(
                // eslint-disable-next-line eqeqeq
                (item) => item.transaction_id != transaction_id
              );
              setRows(updatedData);
              setActiveRowIndex(false);
            } else {
              console.log(`Error while deleting transaction with ID ${id}`);
            }
          }
          // Reset transaction_id after deletion
          setTranscation([]);
          handleReset();
        }
      }
    } catch (error) {
      console.error(error.message);
    }
  };
  useEffect(() => {
    const fiterBrand = unitData.find((item) => item.unit === unit);
    setUnitId(fiterBrand?.unit_id);
  }, [unit, unitData]);
  const handleAddId = (item) => {
    setTranscation((prevIds) => {
      if (prevIds.includes(item.transaction_id)) {
        return prevIds.filter((prevId) => prevId !== item.transaction_id); // Deselect if already selected
      } else {
        return [...prevIds, item.transaction_id]; // Select if not already selected
      }
    });
  };

  return (
    <>
      <div className="full_div_purchases_report">
        <ToastContainer
          theme="light"
          autoClose={1000}
          closeOnClick
          position="top-center"
        />
        <div className="first_row_div_purchase_report">
          <div className="invisible_div_purchase_report">
            <div className="input_field_purchase_report">
              <div className="purchases_report_input">
                <div className="input_field_short_long_purchse_report">
                  <label className="label_field_supershop_purchase">
                    Category*
                  </label>
                  <input
                    value={Searchcategory}
                    onChange={(e) => setSearchcategory(e.target.value)}
                    list="category_list"
                  />
                  <datalist id="category_list" style={{ height: "5vw" }}>
                    {categories.length > 0 &&
                      categories.map((categroy, index) => {
                        return (
                          <option key={index}>{categroy?.category_name}</option>
                        );
                      })}
                  </datalist>
                  <button onClick={() => handleSearchcategory()}>Search</button>
                </div>
                <div className="input_field_short_long_purchse_report">
                  <label className="label_field_supershop_purchase">
                    Supplier*
                  </label>
                  <input
                    value={searchSupplier}
                    onChange={(e) => setSearchSupplier(e.target.value)}
                    list="supplier_list"
                  />
                  <datalist id="supplier_list" style={{ height: "5vw" }}>
                    {supplierData.length > 0 &&
                      supplierData.map((supplier, index) => {
                        return (
                          <option key={index}>
                            {supplier.contributor_name}
                          </option>
                        );
                      })}
                  </datalist>
                  <button onClick={(e) => handleSearchSupplier(e)}>
                    Search
                  </button>
                </div>
              </div>
              <div className="purchases_report_input_date">
                <div className="date_input_field_short_long_purchase_report">
                  <label className="label_field_supershop_purchase">
                    Date*
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                  <button onClick={() => handledateSearch()}>Search</button>
                </div>
                <div className="date_search_input_purchase_report">
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                    }}
                  >
                    <div className="date_input_field_short_long_purchase_report">
                      <label className="label_field_supershop_purchase">
                        From Date*
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={handleStartDateChange}
                      />
                    </div>
                    <div className="date_input_field_short_long_purchase_report">
                      <label className="label_field_supershop_purchase">
                        To Date*
                      </label>
                      <input
                        type="date"
                        onChange={handleEndDateChange}
                        value={endDate}
                      />
                    </div>
                  </div>
                  <div className="purchase_report_search_button">
                    <button onClick={() => handleSearchDateStartend()}>
                      Search
                    </button>
                  </div>
                </div>
              </div>
              <div className="purchases_report_input">
                <div className="input_field_short_long_purchse_report">
                  <label className="label_field_supershop_purchase">
                    Product Name*
                  </label>
                  <input
                    onChange={(e) => setSearchProductName(e.target.value)}
                    list="product_list"
                    value={searcProductName}
                  />
                  <datalist id="product_list">
                    {productdata.length > 0 &&
                      productdata.map((product, index) => {
                        return <option key={index}>{product.name}</option>;
                      })}
                  </datalist>
                  <button onClick={() => handleSearch()}>Search</button>
                </div>
                <div className="input_field_short_long_purchse_report">
                  <label className="label_field_supershop_purchase">
                    Product Code*
                  </label>
                  <input
                    onChange={(e) => setSearchProductCode(e.target.value)}
                    list="product_code_list"
                    value={searcProductCode}
                  />
                  <datalist id="product_code_list">
                    {productdata.length > 0 &&
                      productdata.map((product, index) => {
                        return (
                          <option key={index}>{product.product_code}</option>
                        );
                      })}
                  </datalist>
                  <button onClick={() => handleSearchproductcode()}>
                    Search
                  </button>
                </div>
              </div>
              <div className="show_all_purchase_button">
                <button onClick={handelShowData}>
                  <MdOutlinePreview style={{ fontSize: "2vw" }} />
                </button>
                <div className="button_title">Show All</div>
              </div>
            </div>
          </div>
        </div>
        <div className="second_row_div_purchase_report">
          <div className="table_supershop_purchase_report">
            <div
              className={`${
                loading ? "loader_spriner" : ""
              } table_div_supershop_purchase`}
              ref={tableRef}
            >
              {loading ? (
                <RotatingLines
                  strokeColor="grey"
                  strokeWidth="5"
                  animationDuration="0.75"
                  width="64"
                  visible={true}
                />
              ) : rows.length > 0 ? (
                <div>
                  <table
                    className=""
                    border={3}
                    cellSpacing={2}
                    cellPadding={5}
                  >
                    <thead>
                      <tr>
                        <th style={Color}>Serial</th>
                        <th style={Color}>Invoice</th>
                        <th style={Color}>Supplier</th>
                        <th style={Color}>Category</th>
                        <th style={Color}>Product Code</th>
                        <th style={Color}>Product Name</th>
                        <th style={Color}>Product Type</th>
                        <th style={Color}>Brand</th>
                        <th style={Color}>Quantity</th>
                        <th style={Color}>Unit</th>
                        <th style={Color}>Purchase Price</th>
                        <th style={Color}>Discount</th>
                        <th style={Color}>Item Total</th>
                        <th style={Color}>Sale Price</th>
                        <th style={Color}>Date</th>
                        {/* <th style={Color}>Shop</th> */}
                        {activeRowIndex ? <th style={Color}>Select</th> : ""}
                      </tr>
                    </thead>

                    <tbody>
                      {rows.map((row, index) => (
                        <tr
                          key={index}
                          className={
                            row.transaction_id === transactionId
                              ? "active-row"
                              : ""
                          }
                        >
                          <td onClick={() => handlerow(row, index)}>
                            {index + 1}
                          </td>
                          <td onClick={() => handlerow(row, index)}>
                            {row.invoice_no}
                          </td>
                          <td onClick={() => handlerow(row, index)}>
                            {row.ContributorName?.contributor_name}
                          </td>
                          <td onClick={() => handlerow(row, index)}>
                            {row.ProductTrace?.Category?.category_name}
                          </td>
                          <td onClick={() => handlerow(row, index)}>
                            {row.ProductTrace?.product_code}
                          </td>
                          <td onClick={() => handlerow(row, index)}>
                            {row.ProductTrace?.name}
                          </td>
                          <td onClick={() => handlerow(row, index)}>
                            {row.ProductTrace?.type}
                          </td>
                          <td onClick={() => handlerow(row, index)}>
                            {row.Brand?.brand_name}
                          </td>
                          <td onClick={() => handlerow(row, index)}>
                            {row.quantity_no}
                          </td>
                          <td onClick={() => handlerow(row, index)}>
                            {row.Unit?.unit}
                          </td>
                          <td onClick={() => handlerow(row, index)}>
                            {row.purchase_price}
                          </td>
                          <td onClick={() => handlerow(row, index)}>
                            {row.discount}%
                          </td>
                          <td onClick={() => handlerow(row, index)}>
                            {row.discount > 0
                              ? calculateTotalWithDiscount(
                                  row.purchase_price,
                                  row.quantity_no,
                                  row.discount
                                )
                              : (
                                  parseFloat(row.purchase_price) *
                                  parseFloat(row.quantity_no)
                                ).toFixed(1)}
                          </td>
                          <td onClick={() => handlerow(row, index)}>
                            {row.sale_price}
                          </td>
                          <td onClick={() => handlerow(row, index)}>
                            {row.date.split("T")[0]}
                          </td>
                          {/* <td onClick={() => handlerow(row, index)}>
                            {row.ShopName?.shop_name}
                          </td> */}
                          {activeRowIndex ? (
                            <td onClick={() => handleAddId(row, index)}>
                              <input type="checkbox" />
                            </td>
                          ) : (
                            ""
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="not_found">
                  <div>
                    <img
                      src="https://cdn-icons-png.flaticon.com/128/6146/6146689.png"
                      alt=""
                      width={70}
                    />
                  </div>
                  Not found any machting data
                  <p className="notFound_text">
                    Instead, try searching this way
                  </p>
                </div>
              )}
            </div>
            <div className="input_field_short_total">
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: "1vw",
                  width: "4vw",
                }}
                className="label_field_supershop_purchase"
              >
                Total
              </label>
              <input
                value={TotalAmount.toFixed(2)}
                style={{ fontSize: "1.3vw" }}
                className="input_field_supershop_purchase"
              />
            </div>
          </div>
        </div>
        <div className="third_row_div_purchase">
          <div className="first_column_second_row_purchase_report">
            <div className="first_column_second_row_input_field_purchase_report">
              <div>
                <div className="input_field_short_long_purchse_report">
                  <label className="label_field_supershop_purchase">
                    Category
                  </label>
                  <input type="text" value={category} />
                </div>

                <div className="input_field_short_long_purchse_report">
                  <label className="label_field_supershop_purchase">
                    Product Code
                  </label>
                  <input type="text" value={product_code} />
                </div>
                <div className="input_field_short_long_purchse_report">
                  <label>Product Name</label>
                  <input
                    type="text"
                    value={product_name}
                    style={{ boxShadow: "none" }}
                  />
                </div>
                <div className="input_field_short_long_purchse_report">
                  <label className="label_field_supershop_purchase">
                    Product Type
                  </label>
                  <input type="text" value={product_type} />
                </div>
              </div>
              <div>
                <div className="input_field_short_long_purchse_report">
                  <label className="label_field_supershop_purchase">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={qunatity}
                    className="input_field_supershop_purchase_long quantity_add_purchaes_report"
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                  <select
                    type="text"
                    value={unit}
                    className="unit_add_purchaes_report"
                    onChange={(e) => setUnit(e.target.value)}
                  >
                    <option disabled selected></option>
                    {unitData.length > 0 &&
                      unitData.map((unit, index) => (
                        <option key={index}>{unit.unit}</option>
                      ))}
                  </select>
                </div>
                <div className="input_field_short_long_purchse_report">
                  <label className="label_field_supershop_purchase">
                    Purchase Price
                  </label>
                  <input
                    type="text"
                    value={purchase_price}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                  />
                </div>
                <div className="input_field_short_long_purchse_report">
                  <label className="label_field_supershop_purchase">
                    Discount
                  </label>
                  <input
                    type="text"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    disabled
                  />
                </div>
                <div className="input_field_short_long_purchse_report">
                  <label className="label_field_supershop_purchase">
                    Item Total
                  </label>
                  <input type="text" value={total} />
                </div>
              </div>
              <div>
                <div className="input_field_short_long_purchse_report">
                  <label className="label_field_supershop_purchase">
                    Sale Price
                  </label>
                  <input
                    type="text"
                    value={sale_price}
                    onChange={(e) => setSalePrice(e.target.value)}
                  />
                </div>
                <div className="input_field_short_long_purchse_report">
                  <label className="label_field_supershop_purchase">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    onChange={(e) => setPurchasedate(e.target.value)}
                    value={purchase_date.split("T")[0]}
                  />
                </div>
                <div className="input_field_short_long_purchse_report">
                  <label className="label_field_supershop_purchase">Shop</label>
                  <input type="text" value={shop_name} />
                </div>
              </div>
            </div>
            <div className="all_update_button_purchses_report">
              <div className="update_button_purchses_report">
                <button onClick={handleUpdate}>
                  <img src={update} alt="" />
                </button>
                Update
              </div>
              {/* <div className="Second_update_button_purchses_report">
                <div style={{ display: "none" }}>
                  <ComponentToPrint ref={componentRef} />
                </div>
                <button onClick={handlePrint}>
                  <img src={invoiceimg} alt="" />
                </button>
                View Invoice
              </div> */}
            </div>
          </div>

          <div className="second_column_second_row_purchase_report">
            <div className="reset_button_purchses_report">
              <button onClick={handleResetAll}>
                <img src={reset} alt="" />
              </button>
              Reset
            </div>
            <div className="reset_button_purchses_report">
              <button onClick={deleteTransection}>
                <img src={Delete} width={25} alt="" />
              </button>
              Delete
            </div>
            <div className="reset_button_purchses_report">
              <button
                onClick={() =>
                  exportToExcel(newDataArray, "Product Purchase Report")
                }
                disabled={data.length > 0 ? false : true}
              >
                <img src={Excel} alt="" />
              </button>
              Excel
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PurchasesReport;

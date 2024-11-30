import React, { useCallback } from "react";
import "./sale_page.css";
import { Button, Modal } from "antd";
import { useState, useEffect, useRef } from "react";
import Invoice from "../../image/Invoice.png";
import reset from "../../image/reset.png";
import Save from "../../image/Save.png";
import { useReactToPrint } from "react-to-print";
import { PosInvoice } from "../../components/Pos.js";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import Delete from "../../image/delete.png";
import update from "../../image/Update.png";
const SalePage = () => {
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; // Format the date as 'YYYY-MM-DD'
    return formattedDate;
  });

  // Use the formattedStock array here
  const [isInvoiceUpdated, setIsInvoiceUpdated] = useState(false);
  const [searchCustomerName, setSearchCustomerName] = useState("");
  const today = new Date();
  const hours = String(today.getHours()).padStart(2, "0");
  const minutes = String(today.getMinutes()).padStart(2, "0");
  const seconds = String(today.getSeconds()).padStart(2, "0");

  const formattedDateTime = `${currentDate} ${hours}:${minutes}:${seconds}`;

  const Color = {
    background: "rgba(6, 52, 27, 1)",
  };

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const Employee = localStorage.getItem("username");
  const [contributor_name, setContributorName] = useState("");
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [shopNameData, setShopNAmeData] = useState([]);
  // const [Employee, setEmployee] = useState("");
  const [payment_id, setpaymentId] = useState("");
  const [invoice, setInvoice] = useState("");
  const [pay, setpay] = useState("");
  const [due, setDue] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [netTotal, setNetTotal] = useState("");
  const [paid, setPaid] = useState(null);
  const [changeAmount, setChangeAmount] = useState("");
  const [data, setData] = useState([]);
  const [formattedStock, seFormattedData] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerID, setCustomerID] = useState("");
  const [VAT, setVAT] = useState(0);
  const [paymentTypeData, setpaymentTypeData] = useState([]);
  const [customerData, setCustomer] = useState([]);
  const [VatData, setVatData] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [filterCustomerData, setFilterCustomerData] = useState([]);
  const [vatID, setVatID] = useState("");
  const [SaleData, setSalePriceData] = useState([]);
  const [fixData, setFixData] = useState([]);
  const [contributorNameError, setcontributorNameError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [checkbox, setCheckBox] = useState(false);
  const [vatAmount, setVatAmount] = useState("");

  // eslint-disable-next-line no-unused-vars
  const [available, setAvailable] = useState([]);
  // const [rowDeleteModal, setRowDeltemodal] = useState(false)
  const [cuttingCharge, setCuttingCharge] = useState(null);
  const [dressingCharge, setDressingCharge] = useState(null);

  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
  });

  useEffect(() => {
    document.title = "Sale Page";
    if (paymentTypeData && paymentTypeData.length > 0) {
      const cashpayment = paymentTypeData.find(
        (data) => data.payment_type === "Cash"
      );
      if (cashpayment) {
        setpaymentId(cashpayment.payment_type_id);
      }
    }
  }, [paymentTypeData]);

  // handle data fatch
  const handleDataFetch = useCallback(async (signal) => {
    try {
      const filteredTransactions = await axiosInstance.get(
        `transactionsRouter/getAllTransactionByFiltered?operation_type_id=2`,
        { signal }
      );
      setData(filteredTransactions.data);

      const filterSaleTransactions = await axiosInstance.get(
        `/transactionsRouter/getStockQuantities`,
        { signal }
      );

      seFormattedData(filterSaleTransactions.data.formattedStock);
    } catch (error) {
      console.error("Error fetching or storing transectionsData Data :", error);
    }
  }, []);

  const fetchData = async (signal) => {
    try {
      const response = await axiosInstance.get("/paymenttypes/getAll", {
        signal,
      });
      setpaymentTypeData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchCustomerData = async (signal) => {
    if (filterCustomerData.length > 0) {
      setCustomer(filterCustomerData);
      HandleResetSupplier();
      return;
    }
    try {
      const response = await axiosInstance.get("/contributorname/getAll", {
        signal,
      });

      const filteredData = response.data.filter(
        (item) => item.contributor_type_id === 1
      );
      setFilterCustomerData(filteredData);
      setCustomer(filteredData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchShop = async (signal) => {
    try {
      const response = await axiosInstance.get("/shopname/getAll", { signal });
      setShopNAmeData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const fetchVatData = async (signal) => {
    try {
      const response = await axiosInstance.get("/tax/getAll", { signal });

      setVatData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    handleDataFetch(controller.signal);

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller1 = new AbortController();
    const controller2 = new AbortController();
    const controller3 = new AbortController();
    const controller4 = new AbortController();

    fetchData(controller1.signal);
    fetchCustomerData(controller2.signal);
    fetchShop(controller3.signal);
    fetchVatData(controller4.signal);

    return () => {
      controller1.abort();
      controller2.abort();
      controller3.abort();
      controller4.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (customerName) {
      const result = customerData.find(
        (item) => item.contributor_name === customerName
      );
      if (result) {
        setCustomerID(result.contributor_name_id);
        setCustomerAddress(result.address);
        setCustomerPhone(result.mobile);
      } else {
        setCustomerID("");
        setCustomerAddress("");
        setCustomerPhone("");
      }
    }
  }, [customerName, customerData]);

  // Pop Up Window
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setActiveCustomerRow(null);
    setCustomerContributorId(null);
  };
  const initialItems = Array.from({ length: 1 }, () => ({
    itemCode: "",
    product_name: "",
    product_type: "",
    sale_price: "",
    quantity: "",
    stock: "",
    itemTotal: "",
    unit: "",
    product_trace_id: "",
    unit_id: "",
    purchase_price: "",
  }));

  const [items, setItems] = useState(initialItems);

  const inputRefs = useRef([]);

  // Function to add a new row with refs
  const addRowRefs = () => {
    inputRefs.current.push(
      Array.from({ length: items.length }, () => React.createRef())
    );
  };
  useEffect(() => {
    // Delay focus until the inputs are rendered
    setTimeout(() => {
      if (inputRefs.current[0] && inputRefs.current[0][0]) {
        inputRefs.current[0][0].focus(); // Directly focus without .current as inputRefs stores the element
      }
    }, 0); // Zero delay to wait for next event loop cycle
  }, []);
  // Call addRowRefs function whenever you need to add a new row
  addRowRefs();

  const handleKeyPress = (event, rowIndex, colIndex) => {
    if (event.key === "Enter") {
      // Handle Enter key press
      event.preventDefault();

      if (
        rowIndex === items.length - 1 &&
        items[rowIndex].itemTotal !== "" &&
        items[rowIndex].unit !== ""
      ) {
        // Add a new row
        setItems([
          ...items,
          {
            itemCode: "",
            product_name: "",
            product_type: "",
            sale_price: "",
            quantity: "",
            stock: "",
            itemTotal: "",
            unit: "",
            product_trace_id: "",
            unit_id: "",
            purchase_price: "",
          },
        ]);

        // Focus on the first input field of the newly added row
        setTimeout(() => {
          const nextRowIndex = rowIndex + 1;
          const nextRowInputField = inputRefs.current[nextRowIndex][0];
          if (nextRowInputField) {
            nextRowInputField.focus(); // Focus on the input field of the next row
          }
        },200  );
      } else if (colIndex < 6) {
        // Move focus to the next input field in the same row
        setTimeout(() => {
          if (
            inputRefs.current[rowIndex] &&
            inputRefs.current[rowIndex][colIndex + 1]
          ) {
            inputRefs.current[rowIndex][colIndex + 1].focus();
          }
        });
      }
    } else if (event.key === "Delete") {
      // Handle Delete key press
      event.preventDefault();

      // Check if the current row index is greater than 0
      if (rowIndex > 0) {
        // Confirm deletion
        const confirmDelete = window.confirm(
          "Are you sure you want to delete this row?"
        );
        if (confirmDelete) {
          // Delete the current row
          const updatedItems = items.filter(
            (item, index) => index !== rowIndex
          );
          setItems(updatedItems);
        }
      }
    }
  };

  const getFieldName = (index) => {
    switch (index) {
      case 0:
        return "itemCode";
      case 1:
        return "product_name";
      case 2:
        return "product_type";
      case 3:
        return "sale_price";
      case 4:
        return "quantity";
      case 5:
        return "stock";
      case 6:
        return "itemTotal";
      case 7:
        return "unit";
      default:
        return "";
    }
  };

  const totalAmount =
    items && items.length > 0
      ? items.reduce((total, item) => {
          // const salePrice = parseFloat(item.sale_price) || 0;
          // const quantity = parseFloat(item.quantity) || 0;
          const itemTotal = parseFloat(item.itemTotal);
          total += itemTotal;
          return total;
        }, 0)
      : 0;
  useEffect(() => {
    const discountAmount =
      Math.round(totalAmount * (parseFloat(discount) / 100)) || "";
    setDiscountPrice(discountAmount);
  }, [discount, totalAmount]);

  const discountPercentage = discountPrice
    ? ((discountPrice / totalAmount) * 100).toFixed(1)
    : "";

  const totalWithDiscount =
    Math.round(totalAmount - discountPrice) || totalAmount;
  useEffect(() => {
    if (VAT && totalWithDiscount) {
      const vatAmount = Math.round(totalWithDiscount * (VAT / 100));
      const totalWithVAT = Math.round(totalWithDiscount + vatAmount);
      setNetTotal(totalWithVAT);
      setVatAmount(vatAmount);
    } else {
      setNetTotal(totalWithDiscount);
    }
  }, [VAT, totalWithDiscount]);

  const chargeWithAmount = Math.round(
    netTotal +
      (parseFloat(cuttingCharge) || 0) +
      (parseFloat(dressingCharge) || 0)
  );

  useEffect(() => {
    if (!pay) {
      setPaid(0);
      return;
    }
    if (parseInt(pay) > chargeWithAmount) {
      const changed = parseInt(pay) - chargeWithAmount;
      setPaid(chargeWithAmount);
      setChangeAmount(changed);
      return;
    }
    if (parseInt(pay) < chargeWithAmount) {
      setPaid(pay);
      setChangeAmount(0);
      return;
    } else {
      setPaid(pay);
    }
  }, [chargeWithAmount, pay]);

  useEffect(() => {
    const dueAmount =
      paid > 0
        ? parseFloat(chargeWithAmount) - parseFloat(paid)
        : chargeWithAmount;
    setDue(dueAmount);
  }, [chargeWithAmount, paid]);

  const handleReset = () => {
    setItems([
      {
        itemCode: "",
        product_name: "",
        product_type: "",
        sale_price: "",
        quantity: "",
        stock: "",
        itemTotal: "",
        unit: "",
        product_trace_id: "",
        unit_id: "",
        purchase_price: "",
      },
    ]);

    setCustomerName("");
    setDiscount("");
    setVAT(0);
    setVatAmount("");
    setpay("");
    setSalePriceData([]);
    setChangeAmount("");
    setCuttingCharge("");
    setDressingCharge("");
    setCustomerAddress("");
    setCustomerPhone("");
    setCustomerID("");
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSave = async (event) => {
    if (event.detail > 1) {
      return;
    }
    const charge =
      Math.round(parseFloat(cuttingCharge) || 0) +
      (parseFloat(dressingCharge) || 0);
    const newTransactions = items
      .filter((item) =>
        Object.values(item).some((val) => val !== "" && val !== null)
      )
      .map((item) => ({
        invoice_no: invoice,
        product_trace_id: item.product_trace_id,
        quantity_no: item.quantity,
        unit_id: item.unit_id || null,
        warranty: "None",
        tax_id: vatID || 0,
        amount: chargeWithAmount,
        authorized_by_id: 1,
        contributor_name_id: customerID || null,
        operation_type_id: 1,
        date: formattedDateTime,
        payment_type_id: payment_id || null,
        shop_name_id: shopNameData.map((data) => data?.shop_name_id) || null,
        paid: paid || 0,
        employee_id: Employee || "none",
        sale_price: item.sale_price,
        discount: discount || discountPercentage,
        purchase_price: item.purchase_price,
        other_cost: charge,
      }));

    setFixData(items);

    if (
      chargeWithAmount === "" ||
      chargeWithAmount === 0 ||
      isNaN(chargeWithAmount)
    ) {
      toast.dismiss();
      // Show a new toast
      toast.warning("Please fill all required fields before Save the item.", {
        autoClose: 1000, // Adjust the duration as needed (1 second = 1000 milliseconds)
      });
      return;
    }

    try {
      const response = await axiosInstance.post(
        "/transactionsRouter/postTransactionFromAnyPageBulk?operation_type_id=1",
        newTransactions,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setInvoice(response.data);
        setIsInvoiceUpdated(true); // This will trigger the useEffect below
        toast.dismiss();
        toast.success("Data saved successfully!");
        console.log(response.data);
      } else {
        toast.error("Failed to save data");
      }
    } catch (error) {
      console.log(error);
      console.error(error);
      toast.error("Failed to save data. Please try again later.");
      handleReset();
    }
  };
  useEffect(() => {
    if (isInvoiceUpdated) {
      handlePrint();
      handleReset();
      setIsInvoiceUpdated(false); // Reset the state
    }
  }, [isInvoiceUpdated]);

  const handleCustomerSave = async (event) => {
    if (event.detail > 1) {
      return;
    }
    if (contributor_name === "" && (address === "") & (mobile === "")) {
      setcontributorNameError("Can't leave empty field");
      setAddressError("Can't leave empty field");
      setMobileError("Can't leave empty field");
      return;
    }
    if (contributor_name === "") {
      setcontributorNameError("Can't leave empty field");

      return;
    }
    if (address === "") {
      setAddressError("Can't leave empty field");
      return;
    }
    if (mobile === "") {
      setMobileError("Can't leave empty field");
      return;
    }
    const contributor_type_id = 1;
    const contributorExit = customerData.find(
      (data) =>
        data.contributor_name.toLowerCase() === contributor_name.toLowerCase()
    );
    if (contributorExit) {
      toast("Customer Already exit");
      return;
    }
    try {
      const response = await axiosInstance.post(
        "/contributorname/postContributorNameFromAnyPage",
        { contributor_name, address, mobile, contributor_type_id }
      );
      if (response.status === 200) {
        setContributorName("");
        setAddress("");
        setMobile("");
        fetchCustomerData();
        toast.success("Customer Add successfully!");
      } else {
        toast.error("Failed to save Supplier");
      }
    } catch (error) {
      console.error("Error saving brand name:", error);
    }
  };
  const handleupdateSupplier = async (event) => {
    if (event.detail > 1) {
      return;
    }
    if (customerID === null) {
      alert("Please select row");
      return;
    }

    try {
      const response = await axiosInstance.put(
        `contributorname/updateContributorNameByID`,
        {
          contributor_name_id: customerContributorId,
          contributor_name,
          mobile,
          address,
        }
      );

      if (response.status === 200) {
        fetchCustomerData();
        setContributorName("");
        setAddress("");
        setMobile("");
        toast.success("Successfully Update Supplier");
      } else {
        console.log(`Error updateing Supplier `);
      }
    } catch (error) {
      console.log(error.message);
      alert(error.message);
    }
  };

  useEffect(() => {
    const filteredData = VatData.find((item) => item.rate === VAT);
    setVatID(filteredData?.tax_id);
  }, [VatData, VAT]);

  /// select customer and delete
  const [customerContributorId, setCustomerContributorId] = useState(null);
  const [activeSupplierRow, setActiveCustomerRow] = useState(null);

  const handleSupplierRow = (item, index) => {
    if (activeSupplierRow === index) {
      // If the clicked row is already selected, deselect it
      setCustomerContributorId(null); // Assuming null indicates no selection
      setActiveCustomerRow(null); // Clear the active row
      setContributorName("");
      setAddress("");
      setMobile("");
    } else {
      // If a different row is clicked, select it
      setCustomerContributorId(item.contributor_name_id);
      setActiveCustomerRow(index);
      setContributorName(item.contributor_name);
      setAddress(item.address);
      setMobile(item.mobile);
    }
  };
  // delete customer
  const handleDeleteCustomer = async (signal) => {
    if (customerContributorId === null) {
      alert("Please select row");
      return;
    }

    const confirmDelete = window.confirm("Are you sure delete Customer?");

    if (confirmDelete) {
      try {
        const response = await axiosInstance.delete(
          `contributorname/deleteContributorNameByID?contributor_name_id=${customerContributorId}`
        );

        if (response.status === 200) {
          fetchCustomerData();
          handleReset();
          toast.success("Successfully deleted row");
        } else {
          console.log(`Error while deleting row`);
        }
      } catch (error) {
        console.log(error.message);
        alert(error.message);
      }
    } else {
      console.log("ok");
    }
  };

  // const due = parseFloat(netTotal) - parseFloat(pay) || 0;
  const HandleResetSupplier = () => {
    setContributorName("");
    setMobile("");
    setAddress("");
    setCustomerID(null);
    setSearchCustomerName("");
  };
  const handleSupplierSearch = () => {
    const filter = filterCustomerData?.filter((item) =>
      item.contributor_name
        .toLocaleLowerCase()
        .includes(searchCustomerName.toLocaleLowerCase())
    );
    setCustomer(filter);
  };
  ///// handle input
  const handleChange = (e, rowIndex, colIndex) => {
    const { value } = e.target;
    const updatedItems = [...items];
    const fieldName = getFieldName(colIndex);

    // Update the field in the updatedItems array
    updatedItems[rowIndex][fieldName] = value;

    if (fieldName === "itemCode") {
      // Find the matched product based on item code
      const matchedProduct = data
        .slice() // Create a copy to avoid modifying the original array
        .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date, newest first
        .find(
          (product) =>
            product.ProductTrace && product.ProductTrace.product_code === value
        );

      // Retrieve available quantity from formatted stock
      const availableQuantity = formattedStock.find(
        (data) => data.ProductCode == value
      );

      if (matchedProduct) {
        // If a product is matched, update the relevant fields
        updatedItems[rowIndex] = {
          ...updatedItems[rowIndex], // Spread existing row data
          product_name: matchedProduct.ProductTrace?.name,
          product_type: matchedProduct.ProductTrace?.type,
          sale_price: matchedProduct.sale_price,
          purchase_price: matchedProduct.purchase_price,
          unit: matchedProduct.Unit?.unit,
          unit_id: matchedProduct.Unit?.unit_id,
          product_trace_id: matchedProduct.ProductTrace?.product_trace_id,
          quantity: 1, // Reset quantity to 1 or desired initial value
          stock: availableQuantity?.availableQuantity || 0, // Set stock immediately
        };

        // Retrieve available quantity and set state
        setAvailable(availableQuantity);
        const saleData = data.filter(
          (product) =>
            product.ProductTrace && product.ProductTrace.product_code === value
        );
        setSalePriceData(saleData);

        // Focus on the next input
        setTimeout(() => {
          if (inputRefs.current[rowIndex] && inputRefs.current[rowIndex][4]) {
            inputRefs.current[rowIndex][4].focus();
          }
        }, 0); // Delay to ensure the DOM is updated before focusing
      } else {
        // Reset fields if no matched product is found
        updatedItems[rowIndex] = {
          ...updatedItems[rowIndex],
          product_name: "",
          product_type: "",
          sale_price: "",
          unit: "",
          quantity: "",
          purchase_price: "",
          stock: "",
        };
        setpay("");
        setSalePriceData([]);
      }
    }

    // Handle quantity changes
    if (fieldName === "quantity") {
      const enteredQuantity = parseFloat(value);
      const stockQuantity = parseFloat(updatedItems[rowIndex]["stock"]);

      // Check if entered quantity exceeds available quantity
      if (enteredQuantity > stockQuantity) {
        toast.dismiss();
        toast.warning(
          `The entered quantity exceeds the available quantity. ${available?.availableQuantity} ${available?.unit}`
        );
      }
    }

    // Calculate item total
    const salePrice = parseFloat(updatedItems[rowIndex]["sale_price"]);
    const quantity = parseFloat(updatedItems[rowIndex]["quantity"]);
    updatedItems[rowIndex]["itemTotal"] =
      isNaN(salePrice) || isNaN(quantity)
        ? ""
        : Math.round(salePrice * quantity);

    // Update the state with the modified items
    setItems(updatedItems);
  };

  return (
    <div className="full_div_super_shop_sale">
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="frist_row_div_supershop_sale"></div>
      <div className="second_row_div_supershop_sale">
        <div className="container_table_supershop_sale">
          <table border={1} cellSpacing={2} cellPadding={10}>
            <thead>
              <tr>
                <th>BarCode*</th>
                <th>Product Name*</th>
                <th>Product Type</th>
                <th>Sale Price*</th>
                <th>Quantity*</th>
                <th>Stock</th>
                <th>Item Total*</th>
                <th>Unit*</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, rowIndex) => {
                if (!inputRefs.current[rowIndex]) {
                  inputRefs.current[rowIndex] = [];
                }
                return (
                  <tr key={rowIndex}>
                    {Object.keys(item)
                      .slice(0, 8)
                      .map((fieldName, colIndex) => (
                        <td key={colIndex}>
                          <input
                            type="text"
                            className="table_input_field"
                            ref={(el) =>
                              (inputRefs.current[rowIndex][colIndex] = el)
                            }
                            list={
                              getFieldName(colIndex) === "itemCode"
                                ? `item_codes_${rowIndex}`
                                : getFieldName(colIndex) === "sale_price"
                                ? `sale_price_${rowIndex}`
                                : ""
                            }
                            value={item[fieldName]}
                            readOnly={
                              ![0, 3, 4].includes(colIndex) // Make fields read-only if not Barcode, Sale Price, or quantity
                            }
                            style={{
                              backgroundColor: ![0, 4, 3].includes(colIndex)
                                ? "white"
                                : "", // Set background color to white for read-only fields
                            }}
                            //
                            onChange={(e) =>
                              handleChange(e, rowIndex, colIndex)
                            }
                            onKeyDown={(e) =>
                              handleKeyPress(e, rowIndex, colIndex)
                            }
                          />
                          {fieldName === "sale_price" && (
                            <datalist id={`sale_prices_${rowIndex}`}>
                              {SaleData.map((product) => (
                                <option
                                  key={product.product_trace_id}
                                  value={product.sale_price}
                                />
                              ))}
                            </datalist>
                          )}
                          {fieldName === "itemCode" && (
                            <datalist id={`item_codes_${rowIndex}`}>
                              {/* Populate options with sale prices for the scanned product */}
                              {data.length > 0 && (
                                <>
                                  {[
                                    ...new Set(
                                      data.map(
                                        (item) =>
                                          item.ProductTrace?.product_code
                                      )
                                    ),
                                  ].map((productCode, index) => (
                                    <option key={index}>{productCode}</option>
                                  ))}
                                </>
                              )}
                            </datalist>
                          )}
                        </td>
                      ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="third_row_div_supershop_sale">
        <div className="container_buttom_full_div">
          <div className="container_div_view_customer_supershop_sale">
            <div className="customer_setup_supershop_sale">
              <div className="customer_setup_supershop_sale_box">
                <div className="membership_customer">
                  Permanent Customer
                  <input
                    type="checkbox"
                    style={{ marginLeft: "4px" }}
                    onChange={(e) => setCheckBox(e.target.checked)}
                  />
                </div>
                <div className="input_field_supershop_sale">
                  <label>Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    list="list_customer"
                    disabled={checkbox ? false : true}
                  />
                  <datalist id="list_customer">
                    {checkbox &&
                      customerData.length > 0 &&
                      customerData.map((customer, index) => {
                        return (
                          <option key={index} value={customer.contributor_name}>
                            {customer.contributor_name}
                          </option>
                        );
                      })}
                  </datalist>
                </div>
                <div className="input_field_supershop_sale">
                  <label>Customer ID</label>
                  <input
                    type="number"
                    style={{ width: "8vw" }}
                    value={customerID}
                    disabled={checkbox ? false : true}
                  />
                  <Button style={{ width: "3.5vw" }} onClick={showModal}>
                    +
                  </Button>
                </div>
                <div className="input_field_supershop_sale">
                  <label>Customer Phone</label>
                  <input
                    type="text"
                    value={customerPhone}
                    disabled={checkbox ? false : true}
                  />
                </div>
                <div className="input_field_supershop_sale">
                  <label>Customer Address</label>
                  <input
                    type="text"
                    value={customerAddress}
                    disabled={checkbox ? false : true}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="container_shadow_extra">
            <div className="container_input_field_box_supershop_sale">
              <div className="">
                <div className="input_field_bottom_supershop_sale">
                  <label>payment Type*</label>

                  <select
                    value={payment_id}
                    onChange={(e) => setpaymentId(e.target.value)}
                  >
                    {paymentTypeData &&
                      paymentTypeData.map((data) => (
                        <option
                          key={data.payment_type_id}
                          value={data.payment_type_id}
                        >
                          {data.payment_type}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="input_field_bottom_supershop_sale">
                  <label>Current Date*</label>
                  <input
                    value={currentDate}
                    className="date_input_sale_page"
                    type="date"
                    onChange={(e) => setCurrentDate(e.target.value)}
                  />
                </div>
                <div className="input_field_bottom_supershop_sale">
                  <label>Shop Name</label>

                  <input
                    type="text"
                    value={shopNameData.map((data) => data.shop_name)}
                  />
                </div>
                <div className="input_field_bottom_supershop_sale">
                  <label>Employee </label>
                  <input type="text" value={Employee} />
                </div>
                <div className="input_field_bottom_supershop_sale">
                  <label>Total</label>
                  <input type="number" value={totalAmount} />
                </div>
              </div>
              <div className="container_div_saparator_supershop_sale_column2">
                <div className="input_field_bottom_supershop_sale">
                  <label>Discount</label>
                  <input
                    type="number"
                    value={discount || discountPercentage}
                    onChange={(e) => setDiscount(parseFloat(e.target.value))}
                    placeholder="Percentage"
                    className="vat_select_field"
                  />
                  <span style={{ fontWeight: "bold" }}>%</span>
                  <input
                    type="number"
                    value={discountPrice}
                    className="vat_amount_sale_page"
                    placeholder="Amount"
                    onChange={(e) => setDiscountPrice(e.target.value)}
                  />
                </div>
                <div className="input_field_bottom_supershop_sale">
                  <label>Vat</label>
                  <select
                    value={VAT}
                    type="number"
                    onChange={(e) => setVAT(e.target.value)}
                    className="vat_select_field"
                  >
                    {VatData.length > 0 &&
                      VatData.map((vat) => {
                        return (
                          <option key={vat.tax_id} value={vat.rate}>
                            {vat.rate}
                          </option>
                        );
                      })}
                  </select>
                  <span style={{ fontWeight: "bold" }}>%</span>
                  <input
                    type="text"
                    value={vatAmount}
                    className="vat_amount_sale_page"
                    disabled
                  />
                </div>
                <div className="input_field_bottom_supershop_sale">
                  <label>Cutting Charge</label>
                  <input
                    type="number"
                    value={cuttingCharge}
                    onChange={(e) => setCuttingCharge(e.target.value)}
                    required
                  />
                </div>
                <div className="input_field_bottom_supershop_sale">
                  <label>Dressing Charge</label>
                  <input
                    type="number"
                    value={dressingCharge}
                    onChange={(e) => setDressingCharge(e.target.value)}
                    required
                  />
                </div>
                <div className="input_field_bottom_supershop_sale">
                  <label>Net Total</label>
                  <input
                    type="number"
                    value={chargeWithAmount || netTotal}
                    disabled
                  />
                </div>
              </div>
              <div className="container_div_saparator_supershop_sale_column2">
                <div className="input_field_bottom_supershop_sale">
                  <label>Payment</label>
                  <input
                    type="number"
                    value={pay}
                    onChange={(e) => setpay(e.target.value)}
                  />
                </div>
                <div className="input_field_bottom_supershop_sale">
                  <label>Change</label>
                  <input type="number" value={changeAmount} disabled />
                </div>

                <div className="input_field_bottom_supershop_sale">
                  <label>Paid</label>
                  <input type="number" value={paid} disabled />
                </div>
                <div className="input_field_bottom_supershop_sale">
                  <label>Due</label>
                  <input type="number" value={due} disabled />
                </div>
              </div>
              <div className="container_billing_supershop_sale">
                <div className="button-shadow-supershop-sale">
                  <div style={{ display: "none" }}>
                    <PosInvoice
                      ref={componentRef}
                      discount={discount || discountPercentage}
                      VAT={VAT}
                      fixData={fixData}
                      netTotal={chargeWithAmount}
                      pay={pay}
                      due={due}
                      change={changeAmount}
                      cuttingCharge={cuttingCharge}
                      dressingCharge={dressingCharge}
                      invoice_no={invoice}
                      vatAmount={vatAmount}
                      discountAmount={discountPrice}
                      saleBy={Employee}
                    />
                  </div>
                  <button
                    className="billing_button_supershop_sale"
                    onClick={handleSave}
                  >
                    <img src={Invoice} alt="billing" />
                  </button>
                </div>
                <span>Invoice</span>
              </div>
              <div className="container_billing_supershop_sale">
                <div className="button-shadow-supershop-sale">
                  <button
                    className="billing_button_supershop_sale"
                    style={{ cursor: "pointer" }}
                    onClick={handleReset}
                  >
                    <img src={reset} alt="billing" />
                  </button>
                </div>
                <span>Reset</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="popup-window_supershop">
        <Modal
          title="Add Permanent  Customer"
          open={isModalOpen}
          onCancel={handleCancel}
          width={730}
          footer={null}
          style={{
            top: 46,
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <div className="container_permanent_supplier_supershop">
            <div className="first_row_div_permanent_supplier_supershop">
              <div className="container_search_permanent_supplier_supershop">
                <div className="container_separate_permanent_supplier_supershop">
                  <div>
                    <div className="search_permanent_supplier_supershop">
                      <div className="search_permanent_supplier_supershop_column1">
                        <div className="input_field_permanent_supplier_supershop">
                          <label>Customer Name*</label>
                          <input
                            type="text"
                            value={contributor_name}
                            onChange={(e) => {
                              setContributorName(e.target.value);
                              setcontributorNameError("");
                            }}
                            style={{
                              borderColor:
                                contributorNameError && contributor_name === ""
                                  ? "red"
                                  : "",
                            }}
                          />
                          <div className="error_message_supplier">
                            {contributorNameError && contributor_name === ""
                              ? contributorNameError
                              : ""}
                          </div>
                        </div>
                      </div>
                      <div className="search_permanent_supplier_supershop_column2">
                        <div className="input_field_permanent_supplier_supershop">
                          <label>Mobile*</label>
                          <input
                            type="text"
                            value={mobile}
                            onChange={(e) => {
                              setMobile(e.target.value);
                              setMobileError("");
                            }}
                            style={{
                              borderColor:
                                mobileError && mobile === "" ? "red" : "",
                            }}
                          />
                          <div className="error_message_supplier">
                            {mobileError && mobile === "" ? mobileError : ""}
                          </div>
                        </div>
                        <div className="input_field_permanent_supplier_supershop">
                          <label>Address*</label>
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => {
                              setAddress(e.target.value);
                              setAddressError("");
                            }}
                            style={{
                              borderColor:
                                addressError && address === "" ? "red" : "",
                            }}
                          />
                          <div className="error_message_supplier">
                            {addressError && address === "" ? addressError : ""}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="save-and-delete-button-supplier">
                    {customerContributorId ? (
                      <div className="save_button">
                        <button
                          className="button_supershop button2"
                          onClick={handleupdateSupplier}
                        >
                          <img src={update} alt="" />
                        </button>
                        Update
                      </div>
                    ) : (
                      <div className="save_button">
                        <button
                          className="button_supershop button2"
                          onClick={handleCustomerSave}
                        >
                          <img src={Save} alt="" />
                        </button>
                        Save
                      </div>
                    )}
                    <div className="save_button">
                      <button
                        className="button_supershop button2"
                        onClick={handleDeleteCustomer}
                      >
                        <img src={Delete} alt="" />
                      </button>
                      Delete
                    </div>
                    <div className="save_button">
                      <button
                        className="button_supershop button2"
                        onClick={HandleResetSupplier}
                      >
                        <img src={reset} alt="" />
                      </button>
                      Reset
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="searchbar_supplier">
              <div className="input_field_brand_supershop">
                <label>Customer Name</label>
                <input
                  type="text"
                  value={searchCustomerName}
                  onChange={(e) => {
                    setSearchCustomerName(e.target.value);
                  }}
                  list="customer"
                />
                <datalist id="customer">
                  {customerData.length > 0 &&
                    customerData.map((customer, index) => {
                      return (
                        <option key={index} value={customer.contributor_name}>
                          {customer.contributor_name}
                        </option>
                      );
                    })}
                </datalist>
              </div>
              <div className="searchbar_buttton">
                <button onClick={handleSupplierSearch}>Search</button>
              </div>
              <div className="searchbar_buttton" style={{ marginLeft: "4vw" }}>
                <button onClick={fetchCustomerData}>Show All</button>
              </div>
            </div>
            <div className="second_row_modal">
              <div className="table_div_modal">
                <table border={1} cellSpacing={1} cellPadding={2}>
                  <tr>
                    <th style={Color}>Customer Id</th>

                    <th style={Color}>Name</th>
                    <th style={Color}>Mobile</th>
                    <th style={Color}>Address</th>
                  </tr>
                  {customerData &&
                    customerData.map((item, index) => (
                      <tr
                        style={{ cursor: "pointer" }}
                        className={
                          item.contributor_name_id === customerContributorId
                            ? "activeRow"
                            : ""
                        }
                        onClick={() => handleSupplierRow(item, index)}
                      >
                        <td>{item.contributor_name_id}</td>
                        <td>{item.contributor_name}</td>
                        <td>{item.mobile}</td>
                        <td>{item.address}</td>
                      </tr>
                    ))}
                </table>
              </div>
            </div>
          </div>
        </Modal>
      </div>

      {/* <div className="deleteModal_container">
          <Modal
            title={null}
            open={rowDeleteModal}
            onCancel={() => setRowDeltemodal(false)}
            footer={null}
            closable={false}
            styles={{ padding: 0, margin: 0 }}
            style={{
              top: 150,
              bottom: 0,
              left: 120,
              right: 0,
              maxWidth:  "24%" ,
              minWidth: "16%" ,
              height: "2vh",
            }}
          >
           
              <div className="rackDeleteModal">
                <div className="delete_modal">
                  <div className="delete_modal_box">
                    <p className="delete_popup_text">
                      Are you sure to delete this rack?
                    </p>
                    <p className="delete_popup_revert_text">
                      You won't be able to revert this!
                    </p>

                    <div className="delete_modal_btn_div">
                      <button
                        className="delete_modal_buttonCancel"
                        onClick={() => {
                          setRowDeltemodal(false);
                          
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRowDelete}
                        className="delete_modal_buttoDelete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            
            
          </Modal>
        </div> */}
    </div>
  );
};

export default SalePage;

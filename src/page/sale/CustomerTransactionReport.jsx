/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef, useCallback } from "react";
import { BiReset } from "react-icons/bi";
import { MdPreview } from "react-icons/md";
import "./customertranscationreport.css";
import { IoIosSave } from "react-icons/io";
import ExcelExport from "../../components/ExportExcel";
import { RotatingLines } from "react-loader-spinner";
import { ToastContainer, toast } from "react-toastify";
import axios, { all } from "axios";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";
import { forEach } from "lodash";

const CustomerTranscationReport = () => {
  const [customerName, setCustomerName] = useState("");
  const [fixData, setFixData] = useState([]);
  const [rows, setRows] = useState([]);
  const [allCustomer, setAllCustomer] = useState([]);
  const [customer, setCustomer] = useState([]);
  const [contributor_name_id, setID] = useState([]);
  const [mobile, setMobile] = useState([]);
  const [amount, setAmount] = useState("");
  const [paid, setPaid] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [customer_name_id, setCustomerNameID] = useState("");
  const [employee_id, setCollection] = useState("");

  const [date, setDate] = useState("");
  const [transaction_id, setTranstion] = useState("");
  const [data, setData] = useState([]);

  const [shop_name, setshop_name] = useState("");
  const [paginationVisible, setPaginationVisible] = useState(true);
  const [selected, setSelected] = useState(false);
  const toastId = React.useRef(null);
  const [due, setDue] = useState("");
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; // Format the date as 'YYYY-MM-DD'
    return formattedDate;
  });
  const employee = localStorage.getItem("username");
  const tableRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [page, setPage] = useState(1);
  const [Totalpage, setTotalPage] = useState(null);
  const [pageSize, setPageSize] = useState(500);
  const [pageSizes, setPageSizes] = useState([]);

  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
  });

  const handleShowUpdateData = async (offset, size) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        `transactionsRouter/getTransactionWithPaginationByCustomOffset?offset=${offset}&pageSize=${size}`
      );
      console.log(response.data.rows);
      setData(response.data.rows);
      setIsLoading(false);
    } catch (error) {
      console.log(error.message);
    }
  };

  // Call the function

  // const handleClickShowAll = useCallback(async (pages) => {
  //   try {
  //     setIsLoading(true);
  //     const response = await axiosInstance.get(
  //       `/transactionsRouter/getTransactionWithPagination?operation_type_id=1&page=${pages}&pageSize=${pageSize}`
  //     );
  //     setTotalPage(Math.ceil(response.data.count / pageSize));

  //     setIsLoading(false);
  //   } catch (error) {
  //     console.log(error.message);
  //   }
  // }, []);

  const fetchInvoiceItemCount = async () => {
    try {
      const response = await axiosInstance.get(
        "/transactionsRouter/getRowCountByInvoice"
      );

      const pages = [];
      let currentPage = [];
      let currentPageCount = 0;
      let pageNumber = 1;

      response.data.forEach((item) => {
        if (currentPageCount + item.count >= 500) {
          const pageSize = currentPageCount + item.count;

          pages.push({
            page: pageNumber,
            pageSize: pageSize,
            items: [...currentPage, item],
          });

          currentPage = [];
          currentPageCount = 0;
          pageNumber++;
        } else {
          currentPage.push(item);
          currentPageCount += item.count;
        }
      });

      if (currentPage.length > 0) {
        pages.push({
          page: pageNumber,
          pageSize: currentPageCount,
          items: [...currentPage],
        });
      }
      setTotalPage(pages.length);
      setPageSizes(pages);
      console.log(pages);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchCustomerData = async () => {
    try {
      const response = await axiosInstance.get("/contributorname/getAll");
      const filtered = response.data.filter(
        (item) => item && item.contributor_type_id === 1
      );
      setAllCustomer(filtered);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    document.title = "Customer Transactions Report";
    const controller = new AbortController();
    // handleClickShowAll(1);
    fetchCustomerData();
    fetchInvoiceItemCount();

    return () => {
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (pageSizes.length > 0) {
      handleShowUpdateData(1, 500);
    }
  }, [pageSizes]);

  const handelShowSaleData = () => {
    setPage(1);
    setPaginationVisible(true);
    // handleClickShowAll(1);
    handleResetAll();
  };
  const handelDueUpdate = async (event) => {
    if (event.detail > 1) {
      return;
    }

    if (!selected) {
      toast.warning("Please Selected a Row");
      return;
    }

    if (due === 0) {
      toast.warning("Already Paid");
      return;
    }

    const duePaymnet = parseFloat(paid) + parseFloat(due);

    try {
      const response = await axiosInstance.put(
        `/transactionsRouter/updateTransactionPaidFromAnyPageByID?transaction_id=${selected}&paid=${duePaymnet}`
      );
      console.log(response);
      if (response.status === 200) {
        toast.success("Successfully Due Paid.");
        setScrollPosition(tableRef.current.scrollTop);
        const updatedData = rows.map((item) =>
          item.transaction_id === response.data.transaction_id
            ? response.data
            : item
        );
        setRows(updatedData);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleChnage = (name) => {
    if (name) {
      const filter = allCustomer.find(
        (item) =>
          item?.contributor_name.trim().toLocaleLowerCase() ===
          name.trim().toLocaleLowerCase()
      );
      setCustomerNameID(filter?.contributor_name_id);
    }
  };

  //Customer search

  const handleSearchCustomer = async () => {
    if (!customerName) {
      if (!toast.isActive(toastId.current)) {
        toastId.current = toast.warning("Contributor Name Required");
      }
      return;
    }
    const respons = await axiosInstance.get(
      `/transactionsRouter/getTransactionByContributorNameId?contributor_name_id=${customer_name_id}&operation_type_id=1`
    );
    if (respons.status === 200) {
      const responseData = respons.data;
      if (date) {
        const filter = responseData.filter(
          (item) => item.date.split("T")[0] === date
        );
        setData(filter);
        setIsLoading(false);
        setPaginationVisible(false);
        return;
      }
      setData(responseData);
      setIsLoading(false);
      setPaginationVisible(false);
    }
  };
  // Customer Id Search
  // Customer Id Search
  const handleSearchCustomerId = async () => {
    if (!customerId || typeof customerId !== "string") {
      if (!toast.isActive(toastId.current)) {
        toastId.current = toast.warning("Customer Id Is Required");
      }
      return;
    }
    setIsLoading(true);
    const respons = await axiosInstance.get(
      `/transactionsRouter/getTransactionByContributorNameId?contributor_name_id=${customerId}&operation_type_id=1`
    );
    if (respons.status === 200) {
      const responseData = respons.data;
      if (date) {
        const filter = responseData.filter(
          (item) => item.date.split("T")[0] === date
        );
        setData(filter);
        setIsLoading(false);
        setPaginationVisible(false);
        return;
      }
      setData(responseData);
      setIsLoading(false);
      setPaginationVisible(false);
    }
  };

  const handleFilterDate = async () => {
    try {
      if (!date) {
        if (!toast.isActive(toastId.current)) {
          toastId.current = toast.warning("Date Is Required");
        }
        return;
      }
      setIsLoading(true);
      const response = await axiosInstance.get(
        `/transactionsRouter/getTransactionProductOnlyDate?date=${date}&operation_type_id=1`
      );
      if (response.status === 200) {
        const responseData = response.data;

        setData(responseData);
        setPaginationVisible(false);
        setIsLoading(false);
      }
    } catch (error) {
      console.log("Date api Error", error);
      setData([]);
      toast.warning("Not Matching Any Data");
    }
  };

  const handleResetAll = () => {
    setSelected(false);
    setCustomerId("");
    setCustomer("");
    setID("");
    setMobile("");
    setAmount("");
    setPaid("");
    setCurrentDate("");
    setCollection("");
    setTranstion("");
    setshop_name("");
    setDue("");
    setCustomerName("");
    setDate("");
    setScrollPosition(0);
  };

  const handleInputInfield = (item) => {
    setScrollPosition(tableRef.current.scrollTop);
    setSelected(item.transaction_id);
    setCustomer(item.contributor_name ? item.contributor_name : "");
    setID(item.invoice_no);
    setMobile(item.contributor_name ? item.mobile : "");
    setAmount(item.amount);
    setPaid(item.paid);
    setCurrentDate(item.date ? item.date.split("T")[0] : "");
    setshop_name(item.shop_name);
    setCollection(employee);
    setTranstion(item.transaction_id);

    setDue(parseFloat(item.amount) - parseFloat(item.paid));
  };

  //========= deleteTransection================

  const deleteTransection = async (event) => {
    if (event.detail > 1) {
      return;
    }
    try {
      if (!transaction_id) {
        //toast message:
        toast.error("Please Selected A Row !");
      } else {
        const response = await axiosInstance.delete(
          `/transactionsRouter/deleteTransactionByID?transaction_id=${transaction_id}`
        );

        if (response.status === 200) {
          toast.success("Successfully deleted transection");
        } else {
          console.log(`Error while deleting transection`);
        }
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    if (!data) return;

    const formattedTransactions = [
      ...new Set(data.map((item) => item.invoice_no)),
    ].map((invoiceNo) => {
      const transactions = data.filter((item) => item.invoice_no === invoiceNo);

      const totalDiscount = transactions.reduce((total, transaction) => {
        // Calculate the item amount for the current transaction
        const itemAmount =
          parseFloat(transaction.sale_price || 0) *
          parseFloat(transaction.quantity_no || 0);

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

      const vatAmount = transactions[0]?.Tax?.rate || 0;
      const totalVATAmount =
        vatAmount === 0 ? 0 : totalDiscount * (parseFloat(vatAmount) / 100);
      const totalvat = totalDiscount + totalVATAmount;
      const amount = Math.round(
        totalvat + (parseFloat(transactions[0].other_cost) || 0)
      );
      const due = Math.round(
        parseFloat(amount) - parseFloat(transactions[0]?.paid || 0) || 0
      );
      return {
        transaction_id: transactions[0].transaction_id,
        invoice_no: invoiceNo,
        contributor_name: transactions[0]?.ContributorName?.contributor_name,
        mobile: transactions[0]?.ContributorName?.mobile,
        address: transactions[0]?.ContributorName?.address,
        amount: amount || 0,
        paid: Math.round(transactions[0].paid || 0),
        due: due || 0,
        date: transactions[0]?.date?.split("T")[0],
        shop_name: transactions[0]?.ShopName?.shop_name,
        vat: transactions[0].Tax?.rate,
        other_cost: transactions[0].other_cost,
      };
    });

    setRows(formattedTransactions);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const totalAmount =
    rows && rows.length > 0
      ? rows
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
    rows && rows.length > 0
      ? rows
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
  }, [fixData, scrollPosition]);
  const handlePageChange = (newPage) => {
    // Scroll to the top of the page with smooth behavior
    window.scrollTo({ top: 0, behavior: "smooth" });
    const filterPageSize = pageSizes.find((item) => item.page === newPage);
    const size = filterPageSize.pageSize;
    console.log(filterPageSize);

    var offsetSum = 0;
    // pageSizes.forEach((item) => {
    //   // Corrected line
    //   if (item.page <= newPage) {
    //     offsetSum = offsetSum + parseInt(item.PageSize);
    //     console.log(item.pageSize + parseInt(offsetSum));
    //     console.log("ofsum", offsetSum);
    //   }
    // });
    for (let index = 0; index < pageSizes.length; index++) {
      offsetSum = offsetSum + parseInt(pageSizes[index].pageSize);
      if (pageSizes[index].page === newPage - 1) {
        break;
      }
    }
    // Set the new current page
    const offset = parseInt(offsetSum);
    console.log("offset", offset, size);
    setPage(newPage);
    handleShowUpdateData(offset, size);

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
    <div className="full_row_div_supershop_customer_report">
      <ToastContainer stacked autoClose={1000} />
      <div className="container_div_supershop_customer_report">
        <div className="container_serach_supershop_customer_report_column1">
          <span>This Feature Work Only for Permanent Customer</span>
          <div className="container_input_field_supershop_customer_report">
            <div className="input_field_supershop_customer_report">
              <label>Customer Name</label>
              <input
                value={customerName}
                onChange={(event) => {
                  setCustomerName(event.target.value);
                  handleChnage(event.target.value);
                }}
                list="customername"
              />
              <datalist id="customername">
                {allCustomer.length > 0 && (
                  <>
                    {[
                      ...new Set(
                        allCustomer.map((item) => item.contributor_name)
                      ),
                    ].map((ContributorName, index) => (
                      <option key={index}>{ContributorName}</option>
                    ))}
                  </>
                )}
              </datalist>

              <button onClick={() => handleSearchCustomer(fixData)}>
                Search
              </button>
            </div>
            <div className="input_field_supershop_customer_report">
              <label>Customer ID</label>
              <input
                onChange={(event) => setCustomerId(event.target.value)}
                value={customerId}
                list="customerId"
              />
              <datalist id="customerId">
                {allCustomer.length > 0 && (
                  <>
                    {[
                      ...new Set(
                        allCustomer.map((item) => item.contributor_name_id)
                      ),
                    ].map((ContributorId, index) => (
                      <option key={index}>{ContributorId}</option>
                    ))}
                  </>
                )}
              </datalist>
              <button onClick={() => handleSearchCustomerId(fixData)}>
                Search
              </button>
            </div>
            <div className="input_field_supershop_customer_report">
              <label>Date</label>
              <input
                type="date"
                onChange={(event) => setDate(event.target.value)}
                value={date}
              />
              <button onClick={() => handleFilterDate(fixData)}>Search</button>
            </div>
          </div>
        </div>
        <div className="container_serach_supershop_customer_report_column2">
          <div className="container_button_supershop_customer_report">
            <button onClick={handelShowSaleData}>
              <MdPreview />
            </button>
            <span>Show All</span>
          </div>
          <div className="container_button_supershop_customer_report">
            <ExcelExport
              excelData={fixData}
              fileName={"CutomerTranscationReport"}
            />
          </div>
        </div>
      </div>
      <div className="second_div_supershop_customer_report">
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
              className="container_table_supershop_customer_report"
              ref={tableRef}
            >
              <table>
                <tr>
                  <th>Invoice</th>
                  <th>Customer Name</th>
                  <th>Mobile</th>
                  <th>Address</th>

                  <th>Total</th>
                  <th>Paid</th>
                  <th>Due</th>
                  <th>Sale Date</th>
                  <th>Collection By</th>

                  <th>Shop Name</th>
                </tr>
                <tbody>
                  {rows.length > 0 &&
                    rows.map((item) => (
                      <tr
                        key={item.transaction_id}
                        onClick={() => handleInputInfield(item)}
                        className={
                          selected === item.transaction_id
                            ? "rows selected"
                            : "rows"
                        }
                        tabindex="0"
                      >
                        <td className="cutomertr-selected">
                          {item.invoice_no}
                        </td>
                        <td className="cutomertr-selected">
                          {item.contributor_name
                            ? item.contributor_name
                            : "none"}
                        </td>
                        <td className="cutomertr-selected">
                          {item.contributor_name ? item.mobile : "none"}
                        </td>
                        <td className="cutomertr-selected">
                          {item.contributor_name ? item.address : "none"}
                        </td>
                        <td className="cutomertr-selected">{item.amount}</td>
                        <td className="cutomertr-selected">{item.paid}</td>
                        <td className="cutomertr-selected">{item.due}</td>
                        <td className="cutomertr-selected">
                          {item.date ? item.date.split("T")[0] : ""}
                        </td>
                        <td className="cutomertr-selected">{employee}</td>

                        <td className="cutomertr-selected">
                          {item.shop_name ? item.shop_name : ""}
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
      <div className="third_div_supershop_customer_report">
        <div className="container_div_view_update_supershop_customer_report">
          <div className="container_view_supershop_customer_report">
            <div className="input_field_supershop_customer_report">
              <label>Total</label>
              <input
                style={{
                  fontWeight: "bold",
                  fontSize: "1vw",
                  textAlign: "center",
                }}
                value={totalAmount}
                disabled
              />
            </div>
            <div className="input_field_supershop_customer_report">
              <label>Paid</label>
              <input
                style={{
                  fontWeight: "bold",
                  fontSize: "1vw",
                  textAlign: "center",
                }}
                value={totalPaid}
                disabled
              />
            </div>
            <div className="input_field_supershop_customer_report">
              <label>Total Due</label>
              <input
                style={{
                  fontWeight: "bold",
                  fontSize: "1vw",
                  textAlign: "center",
                }}
                value={totalDue}
                disabled
              />
            </div>
          </div>
          <div className="container_update_supershop_customer_report">
            <div className="container_update_supershop_customer_report_column1">
              <div className="input_field_supershop_customer_report">
                <label>Cutomer Name</label>
                <input
                  value={customer}
                  disabled
                  onChange={(event) => setCustomer(event.target.value)}
                />
              </div>
              <div className="input_field_supershop_customer_report">
                <label>Invoice No</label>
                <input
                  value={contributor_name_id}
                  disabled
                  onChange={(event) => setID(event.target.value)}
                />
              </div>
              <div className="input_field_supershop_customer_report">
                <label>Mobile</label>
                <input
                  value={mobile}
                  onChange={(event) => setMobile(event.target.value)}
                  disabled
                />
              </div>
            </div>
            <div className="container_update_supershop_customer_report_column2">
              <div className="input_field_supershop_customer_report">
                <label>Total</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  disabled
                />
              </div>
              <div className="input_field_supershop_customer_report">
                <label>Paid</label>
                <input
                  type="number"
                  value={paid}
                  onChange={(event) => setPaid(event.target.value)}
                  disabled
                />
              </div>

              <div className="input_field_supershop_customer_report">
                <label>Date</label>
                <input
                  type="date"
                  value={currentDate}
                  onChange={(event) => setCurrentDate(event.target.value)}
                  disabled
                />
              </div>
            </div>
            <div className="container_update_supershop_customer_report_column3">
              <div className="input_field_supershop_customer_report">
                <label>Shop Name</label>
                <input value={shop_name} disabled list="payment" />
              </div>
              <div className="input_field_supershop_customer_report">
                <label>Collection By</label>
                <input
                  value={employee_id}
                  onChange={(event) => setCollection(event.target.value)}
                  disabled
                />
              </div>
            </div>
            <div className="container_update_supershop_customer_report_column4">
              <div className="container_button_supershop_customer_report">
                <button onClick={handleResetAll}>
                  <BiReset />
                </button>
                <span>Reset</span>
              </div>
            </div>
          </div>
        </div>
        <div className="container_due_paid_supershop_customer_report">
          <span>Customer Due Payment</span>
          <div className="input_field_supershop_customer_report">
            <label>Due Payment</label>
            <input
              type="number"
              style={{ width: "8vw" }}
              value={due}
              onChange={(evet) => setDue(evet.target.value)}
            />
          </div>
          <div className="container_saparate_button_customer_report">
            <div className="container_button_supershop_customer_report extra-class-button">
              <button onClick={handelDueUpdate}>
                <IoIosSave />
              </button>
              <span>Save</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerTranscationReport;

import React, { useEffect, useState, useRef, useCallback } from "react";
import style from "./CashBook.module.css";
import { Modal } from "antd";
import { FaSearch } from "react-icons/fa";
import { RotatingLines } from "react-loader-spinner";
import ExcelExport from "../../components/ExportExcel";
import toast, { Toaster } from "react-hot-toast";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";

import { MdOutlineViewCozy } from "react-icons/md";
import axios from "axios";

const CashBook = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [calculationItems, setCalculationItems] = useState([]);
  const [paginationVisible, setPaginationVisible] = useState(true);
  const [page, setPage] = useState(1);
  const [Totalpage, setTotalPage] = useState(null);
  const [pageSize, setPageSize] = useState(500);

  const [selectedTabID, setSelectedTabID] = useState(null);
  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
  });

  //date state:
  const [singleDate, setSingleDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const singleDateRef = useRef();
  const fromDateRef = useRef();
  const toDateRef = useRef();
  //transection state :
  // const [transaction_id, setTransectionId] = useState("");

  //cash calsulation state
  const [inAmount, setInAmount] = useState("");
  const [outAmount, setOutAmount] = useState("");
  const [totalCash, setTotalCash] = useState("");
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [CalculationVisible, setCalculationVisible] = useState(false);
  //fetch all transections:
  const handleClickShowAll = useCallback(async (pages) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(
        `/transactionsRouter/getAllTransactions?pageSize=${pageSize}&page=${pages}`
      );

      setTotalPage(Math.ceil(response.data.count / pageSize));
      setIsLoading(false);
    } catch (error) {
      console.log(error.message);
    }
  }, []);

  const fetchData = async (pages) => {
    try {
      setIsLoading(true);

      const response = await axiosInstance.get(
        `/transactionsRouter/getAllTransactions?pageSize=${pageSize}&page=${pages}`
      );

      const filteredInAmountData = Object.values(
        response.data.rows.reduce((acc, curr) => {
          if (!acc[curr.invoice_no] && curr.operation_type_id === 1) {
            acc[curr.invoice_no] = curr;
          }
          return acc;
        }, {})
      );
      const filteredOutData = Object.values(
        response.data.rows.reduce((acc, curr) => {
          if (!acc[curr.invoice_no] && curr.operation_type_id === 2) {
            acc[curr.invoice_no] = curr;
          }
          return acc;
        }, {})
      );
      const expenseData = response.data.rows.filter(
        (acc) => acc.operation_type_id === 3
      );
      const filteredData = [
        ...filteredInAmountData,
        ...filteredOutData,
        ...expenseData,
      ];

      setData(response.data.rows);
      setItems(filteredData);
      setCalculationItems(filteredData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching or storing transectionsData Data :", error);
    }
  };
  const fetchIncomeExpense = async () => {
    try {
      const response = await axiosInstance.get(
        `/transactionsRouter/getIncomeExpense`
      );
      if (response.data) {
        setInAmount(response.data.InAmount);
        setOutAmount(response.data.OutAmount);
        setTotalCash(parseFloat(response.data.Cash).toFixed(2));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  useEffect(() => {
    document.title = "CashBook";
    fetchIncomeExpense();
    fetchData(1);
    handleClickShowAll(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //handle table row:http://194.233.87.22:5004/api/
  const handleClickTableDataShowInputField = (d) => {
    setSelectedTabID(d.transaction_id);
    const selectedTransection =
      items &&
      items.length > 0 &&
      items.find((i) => i.transaction_id === d.transaction_id);

    if (selectedTransection) {
    }
  };

  //date formating:
  const formatDate = (dateString) => {
    const dateObject = new Date(dateString);
    const day = dateObject.getDate();
    const month = dateObject.toLocaleString("default", { month: "long" }); // Month in full name
    const year = dateObject.getFullYear();

    return `${day} ${month} ${year}`;
  };

  //handle Search By SingleDate:
  const handleSearchBySingleDate = async () => {
    setPaginationVisible(false);
    if (singleDate) {
      setCalculationVisible(true);
      try {
        setIsLoading(true);
        const responseProduct = await axiosInstance.get(
          `/transactionsRouter/getTransactionProductWithouOperationTypeOnlyDate?date=${singleDate}`
        );
        if (responseProduct.data.length > 0) {
          const filteredInAmountData = Object.values(
            responseProduct.data.reduce((acc, curr) => {
              if (!acc[curr.invoice_no] && curr.operation_type_id === 1) {
                acc[curr.invoice_no] = curr;
              }
              return acc;
            }, {})
          );
          const filteredOutData = Object.values(
            responseProduct.data.reduce((acc, curr) => {
              if (!acc[curr.invoice_no] && curr.operation_type_id === 2) {
                acc[curr.invoice_no] = curr;
              }
              return acc;
            }, {})
          );
          const expenseData = responseProduct.data.filter(
            (acc) => acc.operation_type_id === 3
          );
          const filteredData = [
            ...filteredInAmountData,
            ...filteredOutData,
            ...expenseData,
          ];
          setItems(filteredData);
          setData(responseProduct.data);
          singleDateRef.current.value = "";
          setIsLoading(false);
        } else {
          setItems([]);
          toast.error("No date found at this search!");
          setIsLoading(false);
        }
      } catch (e) {
        console.log(e);
        setIsLoading(false);
      }
    } else {
      toast.error("Please pick a date to search");
    }
  };

  //handle FromToDateSearch============:
  // Handle search by date range

  const handleSearchByDateRange = async () => {
    setPaginationVisible(false);
    if (fromDate && toDate) {
      setCalculationVisible(true);
      try {
        setIsLoading(true);
        const responseProduct = await axiosInstance.get(
          `transactionsRouter/getTransactionProductWithouOperationTypeFromDateToDate?startDate=${fromDate}&endDate=${toDate}`
        );
        if (responseProduct.data.length > 0) {
          const filteredInAmountData = Object.values(
            responseProduct.data.reduce((acc, curr) => {
              if (!acc[curr.invoice_no] && curr.operation_type_id === 1) {
                acc[curr.invoice_no] = curr;
              }
              return acc;
            }, {})
          );
          const filteredOutData = Object.values(
            responseProduct.data.reduce((acc, curr) => {
              if (!acc[curr.invoice_no] && curr.operation_type_id === 2) {
                acc[curr.invoice_no] = curr;
              }
              return acc;
            }, {})
          );
          const expenseData = responseProduct.data.filter(
            (acc) => acc.operation_type_id === 3
          );

          const filteredData = [
            ...filteredInAmountData,
            ...filteredOutData,
            ...expenseData,
          ];
          setItems(filteredData);
          setData(responseProduct.data);
          singleDateRef.current.value = "";
          setIsLoading(false);
        } else {
          setItems([]);
          toast.error("No date found at this search!");
          setIsLoading(false);
        }
      } catch (e) {
        console.log(e);
        setIsLoading(false);
      }
    } else {
      toast.error("Please select both from and to dates!");
    }
  };

  //handleShowAll:
  const handleShowAll = () => {
    fetchData(1);
    setPage(1);
    fetchIncomeExpense();
    setSingleDate("");
    setToDate("");
    setFromDate("");
    setCalculationVisible(false);
    setPaginationVisible(true);
  };

  const [inAmountData, setInAmountData] = useState([]);
  const [outAmountData, setOutAmountData] = useState([]);

  useEffect(() => {
    if (!data) return;

    const filteredInItems = data.filter((item) => item.operation_type_id === 1);
    const filteredOutItems = data.filter(
      (item) => item.operation_type_id === 2
    );

    const formattedInTransactions =
      filteredInItems &&
      filteredInItems.reduce((acc, transaction) => {
        const invoiceNo = transaction.invoice_no;
        const existingIndex = acc.findIndex(
          (item) => item.invoice_no === invoiceNo
        );

        if (existingIndex !== -1) {
          acc[existingIndex].InAmount += calculateInAmount(transaction);
        } else {
          acc.push({
            invoice_no: invoiceNo,
            InAmount: calculateInAmount(transaction),
          });
        }
        return acc;
      }, []);

    const formattedOutTransactions =
      filteredOutItems &&
      filteredOutItems.reduce((acc, transaction) => {
        const invoiceNo = transaction.invoice_no;
        const existingIndex = acc.findIndex(
          (item) => item.invoice_no === invoiceNo
        );

        if (existingIndex !== -1) {
          acc[existingIndex].OutAmount += calculateOutAmount(transaction);
        } else {
          acc.push({
            invoice_no: invoiceNo,
            OutAmount: calculateOutAmount(transaction),
          });
        }
        return acc;
      }, []);

    setInAmountData(formattedInTransactions);
    setOutAmountData(formattedOutTransactions);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Helper function to calculate InAmount for a transaction
  const calculateInAmount = useCallback((transaction) => {
    const itemAmount =
      parseFloat(transaction.sale_price || 0) *
      parseFloat(transaction.quantity_no || 0);
    const discount =
      transaction.discount > 0
        ? ((itemAmount * parseFloat(transaction.discount)) / 100).toFixed(2)
        : 0;
    return itemAmount - discount + (parseFloat(transaction.other_cost) || 0);
  }, []);

  // Helper function to calculate OutAmount for a transaction
  const calculateOutAmount = (transaction) => {
    const itemAmount =
      parseFloat(transaction.quantity_no) *
      parseFloat(transaction.purchase_price);
    const discount =
      transaction.discount > 0
        ? ((itemAmount * parseFloat(transaction.discount)) / 100).toFixed(2)
        : 0;
    return itemAmount - discount;
  };
  //========amountCalculation===:

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleCalculation = useCallback(() => {
    if (data && data.length > 0) {
      // Calculate the total In amount

      const InAmount = inAmountData.reduce(
        (total, item) => total + parseFloat(item.InAmount),
        0
      );
      setInAmount(InAmount);
      // Calculate the total Out amount
      const filteredOutItems = data.filter(
        // eslint-disable-next-line eqeqeq
        (item) => item.operation_type_id === 3
      );

      const outAmountPurchase =
        outAmountData && outAmountData.length > 0
          ? outAmountData
              .reduce((productamount, item) => {
                if (
                  item.OutAmount !== undefined &&
                  item.OutAmount !== null &&
                  item.OutAmount !== ""
                ) {
                  productamount += Number(item.OutAmount);
                }
                return productamount;
              }, 0)
              .toFixed(2)
          : 0;
      const Expense =
        filteredOutItems &&
        filteredOutItems.reduce(
          (total, item) => total + parseFloat(item.amount),
          0
        );
      const TotalOutAmount = Expense + parseFloat(outAmountPurchase);
      setOutAmount(TotalOutAmount);
      const totalCash = InAmount - TotalOutAmount;
      setTotalCash(outAmountPurchase >= 0 ? totalCash.toFixed(2) : 0);
      setIsLoading(outAmountPurchase >= 0 ? false : true);
    }
  });
  useEffect(() => {
    console.log(isLoading);
    if (CalculationVisible) {
      handleCalculation();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inAmountData, outAmountData]);

  // =========handleXlDownload==========
  // const handleXlDownload = () => {
  //   const data = items;
  //   const fileName = "cashbook_excel_data";
  //   const exportType = exportFromJSON.types.csv;

  //   exportFromJSON({ data, fileName, exportType });
  // };
  //modal functionality:
  // eslint-disable-next-line no-unused-vars
  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleOperation = (d) => {
    if (d.operation_type_id === 1) {
      return "Sale";
    }
    if (d.operation_type_id === 2) {
      return "Purchase";
    }
    if (d.operation_type_id === 3) {
      return "Expense";
    }
  };
  const handlePageChange = (newPage) => {
    // Scroll to the top of the page with smooth behavior
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Set the new current page
    setPage(newPage);
    fetchData(newPage);
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
    <div className={style.cash_Holder}>
      <Toaster />
      <div className={style.cash_container}>
        {/* /==========/header ============== */}
        <div className={`${style.cash_header} ${style.card}`}>
          {/* //dateDiv */}
          <div className={style.dateDiv}>
            <div className={style.date}>
              <div className={style.dateLabelDiv}>
                <label htmlFor="date" className={style.dateLabel}>
                  Date
                </label>
              </div>
              <div className={style.dateInputDiv}>
                <input
                  type="date"
                  className={style.dateInput}
                  value={singleDate}
                  onChange={(e) => setSingleDate(e.target.value)}
                  ref={singleDateRef}
                />
              </div>
            </div>
            <div className={style.dateBtnsearch}>
              <button
                className={style.dateButton}
                onClick={handleSearchBySingleDate}
              >
                <FaSearch className={style.searchIcon} />
              </button>
            </div>
          </div>
          {/* fromToDateDiv */}
          <div className={style.fromToDateDiv}>
            <div className={style.dateDiv}>
              <div className={style.date}>
                <div className={style.dateLabelDiv}>
                  <label htmlFor="date" className={style.dateLabel}>
                    From
                  </label>
                </div>
                <div className={style.dateInputDiv}>
                  <input
                    type="date"
                    className={style.dateInput}
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    ref={fromDateRef}
                  />
                </div>
              </div>
            </div>
            {/* todate */}
            <div className={style.dateDiv}>
              <div className={style.date}>
                <div className={style.dateLabelDiv}>
                  <label htmlFor="date" className={style.dateLabel}>
                    To
                  </label>
                </div>
                <div className={style.dateInputDiv}>
                  <input
                    type="date"
                    className={style.dateInput}
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    ref={toDateRef}
                  />
                </div>
              </div>
            </div>

            {/* //btn */}
            <div className={style.dateBtnsearch}>
              <button
                className={style.dateButton}
                onClick={handleSearchByDateRange}
              >
                <FaSearch className={style.searchIcon} />
              </button>{" "}
            </div>
          </div>
          {/* showAllDiv */}
          <div className={style.showAllDiv}>
            <div className={style.divForALlbutton}>
              <button className={style.showAll_button} onClick={handleShowAll}>
                <MdOutlineViewCozy className="viewAllIcon" />
              </button>
              <p className="buttonTextCash">Show All</p>
            </div>
          </div>
        </div>
        {/* /==========/main ============== */}

        <div className={`${style.cash_main} ${style.card}`}>
          <div
            className={`${isLoading ? "loader_spriner" : ""} ${
              style.cash_tableDiv
            }`}
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
              <table className={style.cash_table}>
                <thead className={style.cash_table_thead}>
                  <tr className={style.cash_table_head_tr}>
                    <th className={style.cash_table_head_th}>Serial</th>
                    <th className={style.cash_table_head_th}>Type</th>
                    <th className={style.cash_table_head_th}>Invoice No</th>
                    <th className={style.cash_table_head_th}>ID</th>
                    <th className={style.cash_table_head_th}>Comment</th>
                    <th className={style.cash_table_head_th}>Date</th>
                    <th className={style.cash_table_head_th}>In Amount</th>
                    <th className={style.cash_table_head_th}>Out Amount</th>
                  </tr>
                </thead>
                <tbody className={style.cash_table_Body}>
                  {items &&
                    items.length > 0 &&
                    items.map((d, index) => {
                      return (
                        <tr
                          key={d.transaction_id}
                          className={`
    ${
      selectedTabID === d.transaction_id
        ? `${style.cash_tr} ${style.tab_selected}`
        : style.cash_tr
    }
  `}
                          onClick={() => handleClickTableDataShowInputField(d)}
                          tabIndex="0"
                        >
                          <td className={style.cash_table_Body_td}>{index}</td>

                          <td className={style.cash_table_Body_td}>
                            {handleOperation(d)}
                          </td>
                          <td className={style.cash_table_Body_td}>
                            {d.invoice_no}
                          </td>
                          <td className={style.cash_table_Body_td}>
                            {d.transaction_id}
                          </td>
                          <td className={style.cash_table_Body_td}>
                            {d.comment ? d.comment : ""}
                          </td>
                          <td className={style.cash_table_Body_td}>
                            {formatDate(d.date)}
                          </td>
                          <td
                            className={`${style.cash_table_Body_td} ${style.inAmount}`}
                          >
                            {d.operation_type_id === 1
                              ? inAmountData
                                  .filter(
                                    (saleAmount) =>
                                      saleAmount.invoice_no === d.invoice_no
                                  )
                                  .map((saleAmount) => (
                                    <span key={saleAmount.id}>
                                      {saleAmount.InAmount.toFixed(2)}
                                    </span>
                                  ))
                              : 0}
                          </td>
                          <td
                            className={`${style.cash_table_Body_td} ${style.outAmount}`}
                          >
                            {d.operation_type_id !== 1
                              ? d.operation_type_id === 2
                                ? outAmountData
                                    .filter(
                                      (saleAmount) =>
                                        saleAmount.invoice_no === d.invoice_no
                                    )
                                    .map((saleAmount) => (
                                      <span key={saleAmount.id}>
                                        {saleAmount.OutAmount.toFixed(2)}
                                      </span>
                                    ))
                                : d.amount
                              : 0}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}
          </div>
          {paginationVisible && (
            <div
              style={{ justifyContent: "flex-end" }}
              className="pagination-buttons"
            >
              {renderPaginationButtons()}
            </div>
          )}
        </div>
        {/* /==========/Footer ============== */}
        <div className={`${style.cash_Footer} ${style.card}`}>
          <div className={style.totalDiv}>
            <div className={style.Amount}>
              <div className={style.amountebelDiv}>
                <label htmlFor="Amount" className={style.amountLabel}>
                  Total In Amount
                </label>
              </div>
              <div className={style.amountInputDiv}>
                <input
                  type="text"
                  className={style.amountInput}
                  value={inAmount}
                />
              </div>
            </div>
            <div className={style.Amount}>
              <div className={style.amountebelDiv}>
                <label htmlFor="Amount" className={style.amountLabel}>
                  Total Out Amount
                </label>
              </div>
              <div className={style.amountInputDiv}>
                <input
                  type="text"
                  className={style.amountInput}
                  value={outAmount}
                />
              </div>
            </div>
            <div className={style.Amount}>
              <div className={style.amountebelDiv}>
                <label htmlFor="Amount" className={style.amountLabel}>
                  Total Cash
                </label>
              </div>
              <div className={style.amountInputDiv}>
                <input
                  type="text"
                  className={style.amountInput}
                  value={totalCash}
                  style={{ color: totalCash > 0 ? "green" : "red" }}
                />
              </div>
            </div>
          </div>
          <div className={style.cashOperationDiv}>
            <div className={style.chasOperationBtnDiv}>
              {/* <button className={style.chasOperationBtn} onClick={showModal}>
                Cash Operation
              </button> */}
            </div>
          </div>
          <div className={style.excelExportDiv}>
            <ExcelExport excelData={items} fileName={"CashBookData"} />
          </div>
        </div>
      </div>

      {/* /===================/cashoperation modal */}
      <div className={style.operationModalDiv}>
        <Modal
          title="Cash Operation"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          footer={null}
          width={"60%"}
          style={{
            top: 150,
          }}
        >
          <div className={style.operationModalContent}>
            <div className={`${style.cash_Footer} ${style.card}`}>
              <div className={style.totalDiv}>
                <div className={style.Amount}>
                  <div className={style.amountebelDiv}>
                    <label htmlFor="Amount" className={style.amountLabel}>
                      *Type
                    </label>
                  </div>
                  <div className={style.amountInputDiv}>
                    <input type="text" className={style.amountInput} />
                  </div>
                </div>
                <div className={style.Amount}>
                  <div className={style.amountebelDiv}>
                    <label htmlFor="Amount" className={style.amountLabel}>
                      Take/Money
                    </label>
                  </div>
                  <div className={style.amountInputDiv}>
                    <input type="text" className={style.amountInput} />
                  </div>
                </div>
                <div className={style.Amount}>
                  <div className={style.amountebelDiv}>
                    <label htmlFor="Amount" className={style.amountLabel}>
                      Comment
                    </label>
                  </div>
                  <div className={style.amountInputDiv}>
                    <input type="text" className={style.amountInput} />
                  </div>
                </div>
              </div>
              <div className={style.excelExportDiv}>
                <div className={style.excelExportBtnDiv}>
                  <button className={style.excelExportBtn}>Save</button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default CashBook;

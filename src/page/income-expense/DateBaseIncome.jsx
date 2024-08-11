import React, { useState, useEffect, useCallback, useMemo } from "react";
import "./datebaseincome.css";
import { MdPreview } from "react-icons/md";
import { RotatingLines } from "react-loader-spinner";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";

const DateBaseIncome = () => {
  const [rows, setRows] = useState([]);
  const [expanceData, setExpanceData] = useState([]);
  const [date, setDate] = useState([]);
  const [formDate, setFormDate] = useState([]);
  const [toDate, setToDate] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState([]);
  const [totalSaleAmount, setTotalSaleAmount] = useState([]);
  const [totalAmountPurchase, setTotalAmountPurchase] = useState([]);
  const [totalDiscount, setTotalDiscount] = useState([]);
  const [totalExpance, setTotalExpance] = useState([]);
  const [totalProfitInDate, setTotalProfitInDate] = useState([]);
  const [totalProfit, SetTotalProfit] = useState([]);
  const [isDateSearchPerformed, setIsDateSearchPerformed] = useState(false);
  const [isDateToFromPerformed, setIsDateToFromPerformed] = useState(false);
  const [paginationVisible, setPaginationVisible] = useState(true);
  const [page, setPage] = useState(1);
  const [Totalpage, setTotalPage] = useState(null);
  const [pageSize, setPageSize] = useState(500);
  const [filterData, setFilteredData] = useState([]);
  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
  });
  const handleClickShowAll = useCallback(async (pages) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(
        `/transactionsRouter/getTransactionWithPagination?operation_type_id=1&page=${pages}&pageSize=${pageSize}`
      );

      const filterSaleTransactions = response.data.rows;
      setTotalPage(Math.ceil(response.data.count / pageSize));
      setRows(filterSaleTransactions);
      setIsLoading(false);
    } catch (error) {
      console.log(error.message);
    }
  }, []);

  const handleShowAllData = useCallback(async () => {
    setIsLoading(true);
    setSearchValue([]);
    setIsDateSearchPerformed(false);
    setIsDateToFromPerformed(false);
    try {
      const responseExpance = await axiosInstance.get(
        "/transactionsRouter/getAllTransactionByFiltered?operation_type_id=3"
      );
      const responseCalculate = await axiosInstance.get(
        "/transactionsRouter/getProfitLoss"
      );

      setExpanceData(responseExpance.data);

      setTotalSaleAmount(responseCalculate.data.totalSaleAmount);
      setTotalAmountPurchase(responseCalculate.data.totalAmountPurchase);
      SetTotalProfit(responseCalculate.data.netProfit);
      setTotalDiscount(responseCalculate.data.totalDiscount);
      setTotalExpance(responseCalculate.data.totalExpense);
      setTotalProfitInDate(responseCalculate.data.totalProfitInDate);
      setIsLoading(false);
    } catch (error) {
      console.log(error.message);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Profit/Loss";
    handleShowAllData();
    handleClickShowAll(page);
    return () => {
      setRows([]);
      setExpanceData([]);
    };
  }, [handleShowAllData]);

  const showAll = () => {
    setPage(1);
    handleShowAllData();
    handleClickShowAll(1);
  };

  // ===================Calculation On Api Call Start ===========================

  const Profit = totalProfit - totalDiscount || 0;

  //===================Calculation On Api Call End ===========================

  //  ====================Search api call=========================

  const handleDateSearch = async () => {
    setPaginationVisible(false);
    if (!date) {
      toast.warning("Date Is Required");
      return;
    }
    setTotalSaleAmount([]);
    setTotalAmountPurchase([]);
    SetTotalProfit([]);
    setTotalDiscount([]);
    setTotalExpance([]);
    setTotalProfitInDate([]);
    setIsLoading(true);
    setIsDateSearchPerformed(true);
    try {
      const responseProduct = await axiosInstance.get(
        `/transactionsRouter/getTransactionProductOnlyDate?date=${date}&operation_type_id=1`
      );
      const responseExpance = await axiosInstance.get(
        `/transactionsRouter/getTransactionProductOnlyDate?date=${date}&operation_type_id=3`
      );
      const filteredInvoiceData = Object.values(
        responseProduct.data.reduce((acc, curr) => {
          if (!acc[curr.invoice_no]) {
            acc[curr.invoice_no] = curr;
          }
          return acc;
        }, {})
      );
      setRows(responseProduct.data);
      setExpanceData(responseExpance.data);
      setFilteredData(responseProduct.data);
      setSearchValue(filteredInvoiceData.data);
      setIsLoading(false);
    } catch (error) {
      console.log(error.message);
      setIsLoading(false);
    }
  };

  const handleFormDateToDate = async () => {
    setPaginationVisible(false);
    if (!formDate || !toDate) {
      toast.warning("Both Date Fields Are Required");
      return;
    }
    setTotalSaleAmount([]);
    setTotalAmountPurchase([]);
    SetTotalProfit([]);
    setTotalDiscount([]);
    setTotalExpance([]);
    setTotalProfitInDate([]);
    setIsLoading(true);
    setIsDateToFromPerformed(true);
    try {
      const responseProduct = await axiosInstance.get(
        `/transactionsRouter/getTransactionProductFromDateToDate?startDate=${formDate}&endDate=${toDate}&operation_type_id=1`
      );
      const responseExpance = await axiosInstance.get(
        `/transactionsRouter/getTransactionProductFromDateToDate?startDate=${formDate}&endDate=${toDate}&operation_type_id=3`
      );
      const filteredInvoiceData = Object.values(
        responseProduct.data.reduce((acc, curr) => {
          if (!acc[curr.invoice_no]) {
            acc[curr.invoice_no] = curr;
          }
          return acc;
        }, {})
      );
      setRows(responseProduct.data);
      setExpanceData(responseExpance.data);
      setSearchValue(filteredInvoiceData.data);
      setIsLoading(false);
    } catch (error) {
      console.log(error.message);
      setIsLoading(false);
    }
  };

  // ===================Calculation On Search Api Call Start ===========================
  const SaleAmountBySearch = useMemo(
    () =>
      filterData
        ?.reduce(
          (total, item) =>
            total +
            (parseFloat(item.sale_price) || 0) *
              (parseFloat(item.quantity_no) || 0),
          0
        )
        .toFixed(2),
    [filterData]
  );

  const OtherCostCalBySearch = useMemo(
    () =>
      searchValue
        ?.reduce((total, item) => total + (parseFloat(item.other_cost) || 0), 0)
        .toFixed(2),
    [searchValue]
  );

  console.log("first", OtherCostCalBySearch);

  // const totalSaleAmount = SaleAmount + OtherCostCal;
  const totalSaleAmountBySearch = useMemo(() => {
    const saleAmountNum = parseFloat(SaleAmountBySearch) || 0;
    const otherCostCalNum = parseFloat(OtherCostCalBySearch) || 0;
    return (saleAmountNum + otherCostCalNum).toFixed(2);
  }, [SaleAmountBySearch, OtherCostCalBySearch]);

  const totalAmountPurchaseBySearch = useMemo(
    () =>
      filterData
        ?.reduce(
          (total, item) =>
            total +
            (parseFloat(item.purchase_price) || 0) *
              (parseFloat(item.quantity_no) || 0),
          0
        )
        .toFixed(2),
    [filterData]
  );

  // const netProfitBySearch = (
  //   totalSaleAmountBySearch - totalAmountPurchaseBySearch
  // ).toFixed(2);

  const netProfitBySearch = useMemo(
    () => (totalSaleAmountBySearch - totalAmountPurchaseBySearch).toFixed(2),
    [totalSaleAmountBySearch, totalAmountPurchaseBySearch]
  );

  const totalDiscountBySearch = useMemo(
    () =>
      searchValue
        ?.reduce((total, item) => total + (parseFloat(item.discount) || 0), 0)
        .toFixed(2),
    [searchValue]
  );

  const ProfitBySearch = useMemo(
    () => (netProfitBySearch - (totalDiscountBySearch || 0)).toFixed(2),
    [netProfitBySearch, totalDiscountBySearch]
  );

  console.log("ProfitBySearch", ProfitBySearch, netProfitBySearch);

  const totalExpanceBySearch = useMemo(
    () =>
      expanceData
        ?.reduce((total, item) => total + (parseFloat(item.amount) || 0), 0)
        .toFixed(2),
    [expanceData]
  );

  const totalProfitBySearch = useMemo(
    () => (ProfitBySearch - totalExpanceBySearch).toFixed(2),
    [ProfitBySearch, totalExpanceBySearch]
  );

  const [selectedID, setSelectedID] = useState(null);
  const handleDataForColor = (item) => {
    setSelectedID(item.transaction_id);
  };
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
    <div className="full_div_date_base_income">
      <ToastContainer stacked autoClose={1000} />
      <div className="container_div_date_base_income">
        <div className="container_first_div_date_base_income">
          <div className="container_serach_date_base_income">
            <div className="input_field_date_base_income">
              <label>Date</label>
              <input
                type="date"
                onChange={(event) => setDate(event.target.value)}
                value={date}
              />
              <button onClick={handleDateSearch}>Search</button>
            </div>
            <div className="container_todate_formdate_base_incume">
              <div className="input_field_date_base_income">
                <label>From Date</label>
                <input
                  type="date"
                  onChange={(event) => setFormDate(event.target.value)}
                  value={formDate}
                />
              </div>
              <div className="input_field_date_base_income">
                <label>To Date</label>
                <input
                  type="date"
                  onChange={(event) => setToDate(event.target.value)}
                  value={toDate}
                />
              </div>
              <div className="input_field_date_base_income">
                <button onClick={handleFormDateToDate}>Search</button>
              </div>
            </div>
            <div className="container_button_date_base_income">
              <button onClick={showAll}>
                <MdPreview />
              </button>
              <span>Show All</span>
            </div>
          </div>
        </div>
        <div className="container_second_div_date_base_income">
          <span>Product Base Report</span>

          {isLoading ? (
            <div className="loading_profit_loss">
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
              <div className="table_div_date_base_income">
                <table>
                  <tr>
                    <th>Product Name</th>
                    <th>Product Type</th>
                    <th>Purchase Price</th>
                    <th>Sale Price</th>
                    <th>Quantity</th>
                    <th>Total Purchase</th>
                    <th>Total Sale</th>
                    <th>Unit</th>
                    <th>Sale Date</th>
                  </tr>
                  <tbody>
                    {rows.length > 0 &&
                      rows.map((item) => (
                        <tr
                          key={item.transaction_id}
                          onClick={() => handleDataForColor(item)}
                          className={
                            selectedID === item.transaction_id
                              ? "rows selected"
                              : "rows"
                          }
                          tabindex="0"
                        >
                          <td className="hover-effect">
                            {item.ProductTrace ? item.ProductTrace.name : ""}
                          </td>
                          <td className="hover-effect">
                            {item.ProductTrace ? item.ProductTrace.type : ""}
                          </td>
                          <td className="hover-effect">
                            {item.purchase_price}
                          </td>
                          <td className="hover-effect">{item.sale_price}</td>
                          <td className="hover-effect">{item.quantity_no}</td>
                          <td className="hover-effect">
                            {(
                              parseFloat(item.purchase_price) *
                              parseFloat(item.quantity_no)
                            ).toFixed(2)}
                          </td>
                          <td className="hover-effect">
                            {(
                              parseFloat(item.sale_price) *
                              parseFloat(item.quantity_no)
                            ).toFixed(2)}
                          </td>
                          <td className="hover-effect">
                            {item.Unit ? item.Unit.unit : ""}
                          </td>
                          <td className="hover-effect">
                            {item.date ? item.date.split("T")[0] : ""}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {paginationVisible && (
                <div
                  style={{ marginTop: "0px", justifyContent: "flex-end" }}
                  className="pagination-buttons"
                >
                  {renderPaginationButtons()}
                </div>
              )}
            </>
          )}
        </div>
        <div className="container_third_div_date_base_income">
          <span>Expense Report</span>
          <div className="flex-center">
            {isLoading ? (
              <RotatingLines
                strokeColor="grey"
                strokeWidth="5"
                animationDuration="0.75"
                width="64"
                visible={true}
              />
            ) : (
              <div className="table_div_date_base_income_expance">
                <table>
                  <tr>
                    <th>Serial</th>
                    <th>Expense Name</th>
                    <th>Cost</th>
                    <th>Date</th>
                  </tr>
                  <tbody>
                    {expanceData.length > 0 &&
                      expanceData.map((item, index) => (
                        <tr
                          key={index.transaction_id}
                          onClick={() => handleDataForColor(item)}
                          className={
                            selectedID === item.transaction_id
                              ? "rows selected"
                              : "rows"
                          }
                          tabindex="0"
                        >
                          <td className="hover-effect">{index + 1}</td>
                          <td className="hover-effect">{item.comment}</td>
                          <td className="hover-effect">{item.amount}</td>
                          <td className="hover-effect">
                            {item.date ? item.date.split("T")[0] : ""}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <div className="container_forth_div_date_base_income">
          <div className="container_div_product_date_base_income">
            <div className="container_view_date_base_income">
              <span className="profit">Product Profit/Loss</span>
              <div className="sub_div_date_base_income">
                <div className="input_field_date_base_income_product">
                  <label>Total Sale Price</label>
                  <div className="input-field">
                    {isDateSearchPerformed || isDateToFromPerformed ? (
                      <input value={totalSaleAmountBySearch} disabled />
                    ) : (
                      <input value={totalSaleAmount} disabled />
                    )}
                    <span>TK</span>
                  </div>
                </div>
                <span>-</span>
                <div className="input_field_date_base_income_product">
                  <label>Toatal Purchase Price</label>
                  <div className="input-field">
                    {isDateSearchPerformed || isDateToFromPerformed ? (
                      <input value={totalAmountPurchaseBySearch} disabled />
                    ) : (
                      <input value={totalAmountPurchase} disabled />
                    )}
                    {/* <input value={totalAmountPurchase} disabled /> */}
                    <span>TK</span>
                  </div>
                </div>
                <span>=</span>
                <div className="input_field_date_base_income_product">
                  <label>Product Profit/Loss</label>
                  <div className="input-field">
                    {isDateSearchPerformed || isDateToFromPerformed ? (
                      <input value={netProfitBySearch} disabled />
                    ) : (
                      <input value={totalProfit} disabled />
                    )}
                    {/* <input value={totalProfit} disabled /> */}
                    <span>TK</span>
                  </div>
                </div>
                <span>-</span>
                <div className="input_field_date_base_income_product">
                  <label>Total Discount</label>
                  <div className="input-field">
                    {isDateSearchPerformed || isDateToFromPerformed ? (
                      <input value={totalDiscountBySearch} disabled />
                    ) : (
                      <input value={totalDiscount} disabled />
                    )}
                    {/* <input value={totalDiscount} disabled /> */}
                    <span>TK</span>
                  </div>
                </div>
                <span>=</span>
                <div className="input_field_date_base_income_product">
                  <label>Total Product Income</label>
                  <div className="input-field">
                    {isDateSearchPerformed || isDateToFromPerformed ? (
                      <input value={ProfitBySearch} disabled />
                    ) : (
                      <input value={Profit} disabled />
                    )}
                    {/* <input value={Profit} disabled /> */}
                    <span>TK</span>
                  </div>
                </div>
              </div>
              {/* <div className="container_button_date_base_income_product">
              <button>Excel</button>
            </div> */}
            </div>
            <div className="container_expence_date_base_income">
              <span>Expense Total</span>
              <div className="input_field_date_base_income_product">
                <label>Total Expense</label>
                <div className="input-field">
                  {isDateSearchPerformed || isDateToFromPerformed ? (
                    <input value={totalExpanceBySearch} disabled />
                  ) : (
                    <input value={totalExpance} disabled />
                  )}
                  {/* <input value={totalExpance} disabled /> */}
                  <span>TK</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container_fifth_div_date_base_income">
          <div className="conatiner_div_last_profit">
            <span>Total Profit/Loss</span>
            <div className="container_div_date_base_income_view">
              <div className="container_pofitloss_date_base_income">
                <div className="input_field_date_base_income">
                  <label style={{ width: "10vw" }}>Total Product Income</label>
                  {isDateSearchPerformed || isDateToFromPerformed ? (
                    // <input value={totalExpanceBySearch} disabled />
                    <input
                      value={ProfitBySearch}
                      disabled
                      style={{
                        fontWeight: "bold",
                        fontSize: "1vw",
                        textAlign: "center",
                      }}
                    />
                  ) : (
                    <input
                      value={Profit}
                      disabled
                      style={{
                        fontWeight: "bold",
                        fontSize: "1vw",
                        textAlign: "center",
                      }}
                    />
                  )}
                  {/* <input
                    value={Profit}
                    disabled
                    style={{
                      fontWeight: "bold",
                      fontSize: "1vw",
                      textAlign: "center",
                    }}
                  /> */}
                  <span>TK</span>
                </div>
                <span>-</span>
                <div className="input_field_date_base_income">
                  <label>Total Expense</label>
                  {isDateSearchPerformed || isDateToFromPerformed ? (
                    <input
                      value={totalExpanceBySearch}
                      disabled
                      style={{
                        fontWeight: "bold",
                        fontSize: "1vw",
                        textAlign: "center",
                      }}
                    />
                  ) : (
                    <input
                      value={totalExpance}
                      disabled
                      style={{
                        fontWeight: "bold",
                        fontSize: "1vw",
                        textAlign: "center",
                      }}
                    />
                  )}
                  {/* <input
                    value={totalExpance}
                    disabled
                    style={{
                      fontWeight: "bold",
                      fontSize: "1vw",
                      textAlign: "center",
                    }}
                  /> */}
                  <span>TK</span>
                </div>
              </div>
              <span>=</span>
              <div>
                <div className="input_field_date_base_income">
                  <label>Total Profit</label>
                  {isDateSearchPerformed || isDateToFromPerformed ? (
                    <input
                      value={totalProfitBySearch}
                      disabled
                      style={{
                        fontWeight: "bold",
                        fontSize: "1vw",
                        textAlign: "center",
                      }}
                    />
                  ) : (
                    <input
                      value={totalProfitInDate}
                      disabled
                      style={{
                        fontWeight: "bold",
                        fontSize: "1vw",
                        textAlign: "center",
                      }}
                    />
                  )}
                  {/* <input
                    value={totalProfitInDate}
                    disabled
                    style={{
                      fontWeight: "bold",
                      fontSize: "1vw",
                      textAlign: "center",
                    }}
                  /> */}
                  <span>TK</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateBaseIncome;

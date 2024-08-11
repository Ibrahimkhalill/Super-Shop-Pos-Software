import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./homeDashboard.css";
import { useTheme } from "../../components/DashboardComponent/context/ThemeContext";
import Footer from "../../components/DashboardComponent/Footer/Footer";
import BarChartBox from "../../components/DashboardComponent/BarChart/BarChartBox";
import PieChartBox from "../../components/DashboardComponent/PiChartBox/PiChartBox";
import TopMenu from "../../components/DashboardComponent/TopMenu/TopMenu";
import ThemeToggle from "../../components/DashboardComponent/ThemeToggle/ThemeToggle";

import {
  monthlySale,
  monthlyTopTenSaleProducts,
  topTenSaleProducts,
  allTimeTopTen_ProductStyle,
  lastTweelveMonth_SaleStyle,
  todaysIncomefunction,
  todaysTotalQuantityFunction,
  todaysSaleFunction,
  CurrentDate,
} from "./chartData";
import axios from "axios";

import TotalAvailableAmount from "../../components/stookquantity/TotalAvailableAmount";

const HomeDashboard = () => {
  // eslint-disable-next-line no-unused-vars
  const [theme, toggle] = useTheme();
  const [rows, setRows] = useState([]);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [PurchasePage, setPurchasePage] = useState(1);
  const [pageSize, setPageSize] = useState(3000);
  const [PurchasePageSize, setPurchasePageSize] = useState(2000);
  const [Totalpage, setTotalPage] = useState(null);
  const [PurchaseTotalpage, setPurchaseTotalPage] = useState(null);

  // eslint-disable-next-line no-unused-vars

  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
  });

  //fetch all transections:

  const fetchData = useCallback(async (signal) => {
    try {
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
    } catch (error) {
      console.log(error.message);
    }
  }, []);

  const handleSaleData = useCallback(async (pages) => {
    try {
      const response = await axiosInstance.get(
        `/transactionsRouter/getTransactionWithPagination?operation_type_id=1&page=${pages}&pageSize=${pageSize}`
      );

      const filterSaleTransactions = response.data.rows;
      setItems((prevRows) => [...prevRows, ...filterSaleTransactions]);
      setPage((prevPage) => prevPage + 1);
      console.log(pages, filterSaleTransactions);
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

  useEffect(() => {
    document.title = "Home";
    const controller = new AbortController();

    fetchData(controller.signal);
    return () => {
      controller.abort();
      setRows([])
      setItems([])
    };
  }, []);

  useEffect(() => {
    if (page <= Totalpage) {
      handleSaleData(page);
    }
    
  }, [Totalpage, page]);

  useEffect(() => {
    if (PurchasePage <= PurchaseTotalpage) {
      handlePurchaseData(PurchasePage);
    }
    
  }, [PurchasePage, PurchaseTotalpage]);

  const AllTimeTopTenSaleProducts = useMemo(
    () => topTenSaleProducts(items),
    [items]
  );

  // Last twelve individual month sale
  const lastTweelveIndividualMonthSale = useMemo(
    () => monthlySale(items),
    [items]
  );
  //=====Real time chard data handling====================
  const LastMonthTopTenSaleProducts = useMemo(
    () => monthlyTopTenSaleProducts(items),
    [items]
  );

  // Today's sale
  const todaysTotalSale = useMemo(
    () => (items ? todaysSaleFunction(items) : 0),
    [items]
  );

  // Today's total income
  const todaysTotalIncome = useMemo(
    () => (items ? todaysIncomefunction(items, rows) : 0),
    [items,rows]
  );

  // Today's total sell quantity
  const todaysTotalsellQuantity = useMemo(
    () => (items ? todaysTotalQuantityFunction(items) : 0),
    [items]
  );

  // Total available amount
  const { totalSaleAmount, totalPurchaseAmount } = useMemo(
    () => TotalAvailableAmount(items, rows),
    [items, rows]
  );

  // Net income
  const netIncome = useMemo(
    () => (items ? (totalSaleAmount - totalPurchaseAmount).toFixed(2) : 0),
    [items, totalSaleAmount, totalPurchaseAmount]
  );
  return (
    <div className="homeDashboard">
      <div className="home_dash_sideBar"></div>
      <div className={`Dashboard_container ${theme} `}>
        <div className="dash_nav">
          <div className="nav_container">
            <div className="nav_left">
              <h1 className="nav_text">DASHBOARD</h1>
            </div>
            <div className="nav_middle">
              <CurrentDate />{" "}
            </div>
            <div className="nav_right">
              <ThemeToggle />
            </div>
          </div>
        </div>
        <div className="dash_main">
          <div className="dash_bar_container">
            {/* <div className="dash_sidebar"></div> */}
            <div className="dash_graph">
              <TopMenu
                data={{
                  todaysTotalSale,
                  todaysTotalIncome,
                  todaysTotalsellQuantity,
                  totalSaleAmount,
                  totalPurchaseAmount,
                  netIncome,
                }}
              />
              <div className="dash_graph_main">
                <div
                  className="bragraph1"
                  style={{ border: theme === "dark" && "1px solid #1f273a" }}
                >
                  <BarChartBox
                    Data={AllTimeTopTenSaleProducts}
                    style={allTimeTopTen_ProductStyle}
                  />
                </div>
                <div
                  className="bragraph2"
                  style={{ border: theme === "dark" && "1px solid #1f273a" }}
                >
                  <BarChartBox
                    Data={lastTweelveIndividualMonthSale}
                    style={lastTweelveMonth_SaleStyle}
                  />
                </div>
                <div
                  className="bragraph3"
                  style={{ border: theme === "dark" && "1px solid #1f273a" }}
                >
                  <PieChartBox data={LastMonthTopTenSaleProducts} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="dash_footer">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default HomeDashboard;

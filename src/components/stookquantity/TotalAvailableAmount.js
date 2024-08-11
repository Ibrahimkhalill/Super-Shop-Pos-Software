import { divide } from "lodash";

function TotalAvailableAmount(sale_item, purchase_item) {
  const formattedSaleTransactions = [
    ...new Set(sale_item.map((item) => item.invoice_no)),
  ].map((invoiceNo) => {
    const transactions = sale_item.filter(
      (item) => item.invoice_no === invoiceNo
    );

    const totalDiscount = transactions.reduce((total, transaction) => {
      const itemAmount =
        parseFloat(transaction.sale_price || 0) *
        parseFloat(transaction.quantity_no || 0);

      if (transaction.discount > 0) {
        const discount = itemAmount * (parseFloat(transaction.discount) / 100);
        const discountedTotal = itemAmount - discount;
        return total + discountedTotal;
      } else {
        return total + itemAmount;
      }
    }, 0);

    const vatAmount = transactions[0]?.Tax?.rate || 0;
    const totalVATAmount =
      vatAmount === 0 ? 0 : totalDiscount * (parseFloat(vatAmount) / 100);
    const totalWithVAT = totalDiscount + totalVATAmount;
    const amount = totalWithVAT + (parseFloat(transactions[0].other_cost) || 0);

    return {
      amount: parseInt(amount) || 0,
    };
  });

  const formattedSale = [
    ...new Set(sale_item.map((item) => item.invoice_no)),
  ].map((invoiceNo) => {
    const transactions = sale_item.filter(
      (item) => item.invoice_no === invoiceNo
    );

    const totalDiscount = transactions.reduce((total, transaction) => {
      const itemAmount =
        parseFloat(transaction.quantity_no || 0) *
        parseFloat(transaction.purchase_price || 0);

      if (transaction.discount > 0) {
        const discount = itemAmount * (parseFloat(transaction.discount) / 100);
        const discountedTotal = itemAmount - discount;
        return total + discountedTotal;
      } else {
        return total + itemAmount;
      }
    }, 0);

    const vatAmount = transactions[0].Tax?.rate || 0;
    const totalVATAmount =
      vatAmount === 0 ? 0 : totalDiscount * (parseFloat(vatAmount) / 100);

    const totalWithVAT = totalDiscount + totalVATAmount;

    return {
      amount: totalWithVAT.toFixed(1),
    };
  });
  const totalSaleAmount = formattedSaleTransactions
    .reduce((sum, item) => {
      if (
        item.amount !== undefined &&
        item.amount !== null &&
        item.amount !== ""
      ) {
        return sum + Number(item.amount);
      }
      return sum;
    }, 0)
    .toFixed(2);

  const formattedPurchaseTransactions = [
    ...new Set(purchase_item.map((item) => item.invoice_no)),
  ].map((invoiceNo) => {
    const transactions = purchase_item.filter(
      (item) => item.invoice_no === invoiceNo
    );

    const totalDiscount = transactions.reduce((total, transaction) => {
      const itemAmount =
        parseFloat(transaction.quantity_no) *
        parseFloat(transaction.purchase_price);

      if (transaction.discount > 0) {
        const discount = itemAmount * (parseFloat(transaction.discount) / 100);
        const discountedTotal = itemAmount - discount;
        return total + discountedTotal;
      } else {
        return total + itemAmount;
      }
    }, 0);

    const vatAmount = transactions[0].Tax?.rate || 0;
    const totalVATAmount =
      vatAmount === 0 ? 0 : totalDiscount * (parseFloat(vatAmount) / 100);

    const totalWithVAT = totalDiscount + totalVATAmount;

    return {
      amount: totalWithVAT.toFixed(1),
    };
  });

  const totalPurchaseAmount = formattedPurchaseTransactions
    .reduce((sum, item) => {
      if (
        item.amount !== undefined &&
        item.amount !== null &&
        item.amount !== ""
      ) {
        return sum + Number(item.amount);
      }
      return sum;
    }, 0)
    .toFixed(2);

  const totalSalePurchaseAmount = formattedSale
    .reduce((sum, item) => {
      if (
        item.amount !== undefined &&
        item.amount !== null &&
        item.amount !== ""
      ) {
        return sum + Number(item.amount);
      }
      return sum;
    }, 0)
    .toFixed(2);

  const totalAvailableAmount = (
    totalPurchaseAmount - totalSalePurchaseAmount
  ).toFixed(2);

  return { totalAvailableAmount, totalSaleAmount, totalPurchaseAmount };
}

export default TotalAvailableAmount;

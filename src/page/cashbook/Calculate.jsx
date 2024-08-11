function Calculate(rows) {
  const filteredOutItems = rows.filter(
    // eslint-disable-next-line eqeqeq
    (item) => item.operation_type_id === 2
  );
  const formattedTransactions = [
    ...new Set(
      filteredOutItems && filteredOutItems.map((item) => item.invoice_no)
    ),
  ].map((invoiceNo) => {
    // Find the transactions with the current invoice number
    const transactions =
      filteredOutItems &&
      filteredOutItems.filter((item) => item.invoice_no === invoiceNo);

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

    const totalvat = totalDiscount + totalVATAmount;

    const due = totalvat - parseFloat(transactions[0].paid || 0);

    return {
      transaction_id: transactions[0].transaction_id,
      invoice_no: invoiceNo,
      contributor_name: transactions[0]?.ContributorName?.contributor_name,
      mobile: transactions[0]?.ContributorName?.mobile,
      address: transactions[0]?.ContributorName?.address,
      amount: totalvat.toFixed(1),
      paid: transactions[0].paid || 0,
      due: due.toFixed(1),
      date: transactions[0]?.date?.split("T")[0],
      shop_name: transactions[0]?.ShopName?.shop_name,
    };
  });
  return formattedTransactions;
}

export default Calculate;

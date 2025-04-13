const btnTransaction = document.querySelector(".transaction-btn");
const tableTransaction = document.querySelector(".table-transaction");
const searchInput = document.getElementById("search-input");

btnTransaction.addEventListener("click", async (e) => {
  e.preventDefault();
  searchInput.classList.remove("hidden");
  tableTransaction.classList.remove("hidden");
  await renderTable();
});

async function renderTable(sortBy = null, order = "asc") {
  try {
    const baseUrl = "http://localhost:3000/transactions";
    const url = sortBy ? `${baseUrl}?_sort=${sortBy}&_order=${order}` : baseUrl;
    const { data } = await axios.get(url);

    tableTransaction.innerHTML =
      buildTableHeader(sortBy, order) + buildTableRows(data);
  } catch (err) {
    tableTransaction.innerHTML =
      "<tr><td colspan='5'>خطا در دریافت اطلاعات.</td></tr>";
  }
}

function buildTableHeader(sortBy, order) {
  const isPriceSorted = sortBy === "price";
  const isDateSorted = sortBy === "date";

  const priceIconClass = isPriceSorted
    ? order === "asc"
      ? "fa-arrow-down"
      : "fa-arrow-up"
    : "fa-arrows-up-down";

  const dateIconClass = isDateSorted
    ? order === "asc"
      ? "fa-arrow-down"
      : "fa-arrow-up"
    : "fa-arrows-up-down";

  return `
    <tr>
      <td>ردیف</td>
      <td>نوع تراکنش</td>
      <td>
        <a class="sort-btn-price" href="#">
          <p>مبلغ</p>
          <i class="fa-solid ${priceIconClass} ${
    isPriceSorted ? "text-primary" : "text-muted"
  }"></i>
        </a>
      </td>
      <td>شماره پیگیری</td>
      <td>
        <a class="sort-btn-date" href="#">
          <p>تاریخ تراکنش</p>
          <i class="fa-solid ${dateIconClass} ${
    isDateSorted ? "text-primary" : "text-muted"
  }"></i>
        </a>
      </td>
    </tr>
  `;
}

function buildTableRows(data) {
  return data
    .map(
      (item) => `
      <tr>
        <td>${item.id}</td>
        <td>${item.type}</td>
        <td>${item.price}</td>
        <td data-transaction-id="${item.refId}">${item.refId}</td>
        <td>${new Date(item.date).toLocaleDateString("fa-IR")}</td>
      </tr>
    `
    )
    .join("");
}

tableTransaction.addEventListener("click", (e) => {
  if (e.target.closest(".sort-btn-price")) {
    toggleSort("price");
  } else if (e.target.closest(".sort-btn-date")) {
    toggleSort("date");
  }
});

let currentSort = {
  field: null,
  order: "asc",
};

function toggleSort(field) {
  if (currentSort.field === field) {
    currentSort.order = currentSort.order === "asc" ? "desc" : "asc";
  } else {
    currentSort.field = field;
    currentSort.order = "asc";
  }
  renderTable(currentSort.field, currentSort.order);
}

searchInput.addEventListener("change", async (e) => {
  const query = Number(e.target.value.trim());

  if (!query) {
    tableTransaction.innerHTML =
      "<tr><td colspan='5'>شماره معتبر وارد کنید.</td></tr>";
    return;
  }

  try {
    const { data: transactions } = await axios.get(
      "http://localhost:3000/transactions"
    );
    const transaction = transactions.find((t) => t.refId === query);

    if (!transaction) {
      tableTransaction.innerHTML =
        "<tr><td colspan='5'>تراکنشی یافت نشد.</td></tr>";
      return;
    }

    tableTransaction.innerHTML =
      buildTableHeader() + buildTableRows([transaction]);
  } catch (err) {
    tableTransaction.innerHTML =
      "<tr><td colspan='5'>خطا در جست‌وجو.</td></tr>";
  }
});

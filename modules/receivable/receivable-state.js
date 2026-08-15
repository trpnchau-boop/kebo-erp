export const state = {
  root: null,
  thead: null,
  tbody: null,
  actionsEl: null,
  historyEl: null,

  mode: "customers",
  loading: false,
  search: "",
  fromDate: "",
  toDate: "",

  rows: [],
  allRows: [],

  // Chứng từ trong kỳ dùng cho danh sách khách hàng.
  documents: [],
  rawDocuments: [],

  // Toàn bộ chứng từ SALE đã ghi sổ của khách đang xem.
  // Dùng để map payment_allocation về đúng mã chứng từ kể cả khi
  // chứng từ đã thu đủ và không còn nằm trong danh sách nợ.
  allCustomerDocuments: [],

  customers: [],
  employees: [],

  payments: [],
  allocations: [],
  rawPayments: [],
  rawAllocations: [],

  allDocuments: [],
  allPayments: [],
  allAllocations: [],

  selectedCustomer: null,

  paymentOpen: false,
  payment: null,
  showHistory: false,


}

export function resetDetail(){
  state.selectedCustomer = null
  state.mode = "customers"
  state.documents = []
  state.allCustomerDocuments = []
  state.allocations = []
  state.payments = []
  state.paymentOpen = false
  state.payment = null
  state.showHistory = false
}

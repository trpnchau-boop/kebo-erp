import { documentSchema } from "./document.js"
import { productSchema } from "./product.js"
import { customerSchema } from "./customer.js"
import { employeeSchema } from "./employee.js"
import { settingsSchema } from "./settings.js"
import { companySchema } from "./company.js"
import { authSchema } from "./auth.js"
import { printSchema } from "./print.js"

export const schema = {
  ...documentSchema,
  ...productSchema,
  ...customerSchema,
  ...employeeSchema,
  ...settingsSchema,  
  ...companySchema,
  ...authSchema,
  ...printSchema
}
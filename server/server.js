import express from 'express'
import cors from 'cors'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://dbfeqstukmfdgdopkzum.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiZmVxc3R1a21mZGdkb3BrenVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDk2NTU1MSwiZXhwIjoyMDkwNTQxNTUxfQ.cGO9M4QRfEo6K5-EFttpgFWqf-PbSeFiuAr2vPpVvuI'
)

const app = express()
app.use(express.json())
app.use(cors())

/* =========================
CREATE USER
========================= */
app.post('/create-user', async (req, res) => {
  try {
    const { email, password, role, employee_id } = req.body

    // validate
    if (!email || !password || !role || !employee_id) {
      return res.json({ success: false, error: "Thiếu dữ liệu" })
    }

    // check employee đã có user chưa
    const { data: existedProfile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('employee_id', employee_id)
      .maybeSingle()

    if (existedProfile) {
      return res.json({ success: false, error: "Nhân sự đã có tài khoản" })
    }

    // 1. tạo auth user
    const { data: userRes, error: createError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })

    if (createError) {
      return res.json({ success: false, error: createError.message })
    }

    const userId = userRes.user.id

    // 2. lấy role_id
    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('code', role)
      .single()

    if (roleError || !roleData) {
      return res.json({ success: false, error: "Role không tồn tại" })
    }

    // 3. insert user_roles
    const { error: roleInsertError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: roleData.id
      })

    if (roleInsertError) {
      return res.json({ success: false, error: roleInsertError.message })
    }

    // 4. insert user_profiles (QUAN TRỌNG)
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        employee_id: employee_id
      })

    if (profileError) {
      return res.json({ success: false, error: profileError.message })
    }

    return res.json({ success: true })

  } catch (err) {
    return res.json({ success: false, error: err.message })
  }
})


/* =========================
DELETE USER
========================= */
app.post('/delete-user', async (req, res) => {
  try {
    const { id } = req.body

    if (!id) {
      return res.json({ success: false, error: "Thiếu user id" })
    }

    // 1. xóa user_profiles
    await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', id)

    // 2. xóa user_roles
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', id)

    // 3. xóa auth user
    const { error } = await supabase.auth.admin.deleteUser(id)

    if (error) {
      return res.json({ success: false, error: error.message })
    }

    return res.json({ success: true })

  } catch (err) {
    return res.json({ success: false, error: err.message })
  }
})


/* =========================
RUN SERVER
========================= */
app.listen(3000, () => {
  console.log("SERVER RUN: http://localhost:3000")
})
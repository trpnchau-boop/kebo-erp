// js/auth.js

import { db } from "./supabase.js"

/* =========================================
GET SESSION
========================================= */

export async function getSession(){

  const {

    data: { session }

  } = await db.auth.getSession()

  return session

}

/* =========================================
IS LOGIN
========================================= */

export async function isLoggedIn(){

  return !!await getSession()

}

/* =========================================
LOGIN
========================================= */

export async function login(email,password){

  return await db.auth.signInWithPassword({

    email,
    password

  })

}

/* =========================================
LOGOUT
========================================= */

export async function logout(){

  return await db.auth.signOut()

}
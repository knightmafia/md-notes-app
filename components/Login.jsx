'use client'

import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const { login, signup } = useAuth()
  const router = useRouter()

  const cantAuth = !email.includes('@') || password.length < 6

  async function handleAuthUser() {
    // check if email is legit and password is acceptable
    if (cantAuth) {
      return
    }
    setIsAuthenticating(true)
    try {
      if (isRegister) {
        // then we need to register a user
        await signup(email, password)
      } else {
        // otherwise they're wanting to login
        await login(email, password)
      }
      // so if we get here with no error, then weve authenicated, so push to
      // the notes page
      router.push('/notes')
    } catch (error) {
      console.log(error.message)
      // Challenge for you - add an error state that is conditionally rendered
      // if there is an error and shows the error message
    } finally {
      setIsAuthenticating(false)
    }
  }
  return (
    <>
      <div className="login-container">
        <h1 className="text-gradient">MDNOTES</h1>
        <h2>Organized note taking made easy.</h2>
        <p>Build your very own archive of easily navigated
          and indexed information and notes.</p>
          <div className="full-line"></div>
          <h6>{isRegister ? 'Create an account' : 'Log in'}</h6>
          <div>
            <p>Email</p>
            <input value={email} onChange={(e) => {
              setEmail(e.target.value)
            }} type="email" placeholder="Enter your email address" />
          </div>
          <div>
            <p>Password</p>
            <input value={password} onChange={(e) => {
              setPassword(e.target.value)
            }} type="password" placeholder="*******" />
          </div>
          <button onClick={handleAuthUser} disabled={cantAuth || isAuthenticating} 
          className="submit-btn">
            <h6>{isAuthenticating ? 'Submitting...' : 'Submit'}</h6>
          </button>
          <div className="secondary-btns-container">
            <button onClick={() => setIsRegister(!isRegister)} className="card-button-secondary">
              <small>{isRegister ? 'Log in' : 'Sign up'}</small>
            </button>
            <button className="card-button-secondary">
              <small>Forgot password?</small>
            </button>
          </div>
          <div className="full-line"></div>
          <footer>
            <a target="_blank" href="https://github.com/knightmafia/">
              <img alt="pfp" src="https://avatars.githubusercontent.com/u/89359978?v=4" />
              <h6>@knightmafia</h6>
              <i className="fa-brands fa-github"></i>
            </a>
          </footer>
      </div>
    </>
  )
}

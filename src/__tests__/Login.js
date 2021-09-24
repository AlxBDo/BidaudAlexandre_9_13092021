/**
* @jest-environment jsdom
*/


import { fireEvent, screen } from "@testing-library/dom"
import LoginUI from "../views/LoginUI"
import Login from '../containers/Login.js'
import { ROUTES } from "../constants/routes"
import  { Firestore } from "../app/Firestore.js"

// random creation of email
const getRandomInteger = (maxNumber = 10) => { return Math.floor(Math.random() * maxNumber) }
const letterArray = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o"]
const getRandomString = (maxLength = false) => {
  let stringRtrn = ""
  if(!maxLength){ maxLength = getRandomInteger() }
  for(let i = 0 ; i <= maxLength; i++){ stringRtrn += letterArray[ getRandomInteger(letterArray.length) ] }
  return stringRtrn
}
const getRandomEmail = () => { return getRandomString() + "@" + getRandomString(5) + "." + getRandomString(2) }

describe("Given that I am a user on login page", () => {
  describe("When I do not fill fields and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI()

      const inputEmailUser = screen.getByTestId("employee-email-input")
      expect(inputEmailUser.value).toBe("")
          
      const inputPasswordUser = screen.getByTestId("employee-password-input")
      expect(inputPasswordUser.value).toBe("")
  
      const form = screen.getByTestId("form-employee")
      const handleSubmit = jest.fn(e => e.preventDefault())  
  
      form.addEventListener("submit", handleSubmit)
      fireEvent.submit(form) 
      expect(screen.getByTestId("form-employee")).toBeTruthy()
    })
  })

  describe("When I do fill fields in incorrect format and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI()

      const inputEmailUser = screen.getByTestId("employee-email-input")
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } })
      expect(inputEmailUser.value).toBe("pasunemail")
          
      const inputPasswordUser = screen.getByTestId("employee-password-input")
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } })
      expect(inputPasswordUser.value).toBe("azerty")
  
      const form = screen.getByTestId("form-employee")
      const handleSubmit = jest.fn(e => e.preventDefault())  
  
      form.addEventListener("submit", handleSubmit)
      fireEvent.submit(form) 
      expect(screen.getByTestId("form-employee")).toBeTruthy()
    })
  })

  describe("When I do fill fields in correct format and I click on employee button Login In", () => {
    test("Then I should be identified as an Employee in app", () => {
      document.body.innerHTML = LoginUI()
      const inputData = {
        email: "johndoe@email.com",
        password: "azerty"
      }

      const inputEmailUser = screen.getByTestId("employee-email-input")
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } })
      expect(inputEmailUser.value).toBe(inputData.email)
          
      const inputPasswordUser = screen.getByTestId("employee-password-input")
      fireEvent.change(inputPasswordUser, { target: { value: inputData.password } })
      expect(inputPasswordUser.value).toBe(inputData.password)

      const form = screen.getByTestId("form-employee")
      
      // localStorage should be populated with form data
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null)
        },
        writable: true
      })

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      let PREVIOUS_LOCATION = ''

      const firebase = jest.fn()

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        firebase
      })

      const handleSubmit = jest.fn(login.handleSubmitEmployee)
      const createUser = jest.fn(login.createUser)        
      form.addEventListener("submit", handleSubmit)
      fireEvent.submit(form)
      expect(handleSubmit).toHaveBeenCalled()
      expect(createUser).not.toBeCalled()
      expect(window.localStorage.setItem).toHaveBeenCalled()
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Employee",
          email: inputData.email,
          password: inputData.password,
          status: "connected"
        })
      )
    })  

    test("It should renders Bills page", () => {
      expect(screen.getAllByText('Mes notes de frais')).toBeTruthy()
    })

    test("Then a new Employee is created in app", () => {

      document.body.innerHTML = LoginUI()

      const user = {
        type: "Employee",
        email: getRandomEmail(),
        password: "azerty",
        status: "connected"
      }

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      let PREVIOUS_LOCATION = ''

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        Firestore
      })

      const userExist = jest.fn(login.checkIfUserExists)

      expect(userExist(user)).toBe(null)

      expect(userExist).toHaveBeenCalledWith(
        {
          type: "Employee",
          email: user.email,
          password: user.password,
          status: "connected"
        }
      )
      
    })

  })
})

describe("Given that I am a user on login page", () => {
  describe("When I do not fill fields and I click on admin button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI()

      const inputEmailUser = screen.getByTestId("admin-email-input")
      expect(inputEmailUser.value).toBe("")
          
      const inputPasswordUser = screen.getByTestId("admin-password-input")
      expect(inputPasswordUser.value).toBe("")
  
      const form = screen.getByTestId("form-admin")
      const handleSubmit = jest.fn(e => e.preventDefault())  
  
      form.addEventListener("submit", handleSubmit)
      fireEvent.submit(form) 
      expect(screen.getByTestId("form-admin")).toBeTruthy()
    })
  })

  describe("When I do fill fields in incorrect format and I click on admin button Login In", () => {
    test("Then it should renders Login page", () => {
      document.body.innerHTML = LoginUI()

      const inputEmailUser = screen.getByTestId("admin-email-input")
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } })
      expect(inputEmailUser.value).toBe("pasunemail")
          
      const inputPasswordUser = screen.getByTestId("admin-password-input")
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } })
      expect(inputPasswordUser.value).toBe("azerty")
  
      const form = screen.getByTestId("form-admin")
      const handleSubmit = jest.fn(e => e.preventDefault())  
  
      form.addEventListener("submit", handleSubmit)
      fireEvent.submit(form) 
      expect(screen.getByTestId("form-admin")).toBeTruthy()
    })
  })

  describe("When I do fill fields in correct format and I click on admin button Login In", () => {
    test("Then I should be identified as an HR admin in app", () => {
      document.body.innerHTML = LoginUI()
      const inputData = {
        type: "Admin",
        email: "johndoe@email.com",
        password: "azerty",
        status: "connected"
      }

      const inputEmailUser = screen.getByTestId("admin-email-input")
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } })
      expect(inputEmailUser.value).toBe(inputData.email)
          
      const inputPasswordUser = screen.getByTestId("admin-password-input")
      fireEvent.change(inputPasswordUser, { target: { value: inputData.password } })
      expect(inputPasswordUser.value).toBe(inputData.password)

      const form = screen.getByTestId("form-admin")
      
      // localStorage should be populated with form data
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null)
        },
        writable: true
      })

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      let PREVIOUS_LOCATION = ''

      const firebase = jest.fn()

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        firebase
      })

      const handleSubmit = jest.fn(login.handleSubmitAdmin)    

      form.addEventListener("submit", handleSubmit)
      fireEvent.submit(form)
        expect(handleSubmit).toHaveBeenCalled()
        expect(window.localStorage.setItem).toHaveBeenCalled()
        expect(window.localStorage.setItem).toHaveBeenCalledWith(
          "user",
          JSON.stringify({
            type: "Admin",
            email: inputData.email,
            password: inputData.password,
            status: "connected"
          })
        )
      })  

    test("It should renders HR dashboard page", () => {
      expect(screen.queryByText('Validations')).toBeTruthy()
    })
  
  })
})

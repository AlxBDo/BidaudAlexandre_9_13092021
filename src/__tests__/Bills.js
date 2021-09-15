/**
* @jest-environment jsdom
*/

import { screen, getByTestId, fireEvent } from "@testing-library/dom"
import LoginUI from "../views/LoginUI"
import Login from '../containers/Login.js'
import BillsUI from "../views/BillsUI.js"
import BillsContainer from '../containers/Bills'
import { ROUTES } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import firebase from "../__mocks__/firebase"
import { bills } from "../fixtures/bills"


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      
      document.body.innerHTML = LoginUI()
      const inputData = {
        email: "johndoe@email.com",
        password: "azerty"
      }

      const inputEmailUser = screen.getByTestId("employee-email-input")
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } })
          
      const inputPasswordUser = screen.getByTestId("employee-password-input")
      fireEvent.change(inputPasswordUser, { target: { value: inputData.password } })

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
      form.addEventListener("submit", handleSubmit)
      fireEvent.submit(form)

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      const user = JSON.stringify({
        type: 'Employee',
        status: "connected"
      })

      window.localStorage.setItem('user', user)

      const billsCont = new BillsContainer (
        {document, onNavigate, firestore: null, localStorage: window.localStorage}
      )

      const html = BillsUI({ data: bills })

      document.body.innerHTML = html 
      
      expect(getByTestId(document.body, "icon-window").classList).toEqual("active-icon")

    })

    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills }) 
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})
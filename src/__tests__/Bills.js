/**
* @jest-environment jsdom
*/

import { screen, getByTestId, fireEvent } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import LoginUI from "../views/LoginUI"
import Login from '../containers/Login.js'
import BillsUI from "../views/BillsUI.js"
import BillsContainer from '../containers/Bills'
import { ROUTES } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { bills } from "../fixtures/bills"


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      const user = JSON.stringify({
        type: 'Employee',
        status: "connected"
      })

      window.localStorage.setItem('user', user)

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const billsCont = new BillsContainer({document, onNavigate, firestore: null, localStorage: window.localStorage})
      
      const html = BillsUI({ data: billsCont.getBills() })

      document.body.innerHTML = html 
      
      expect(getByTestId(document.body, "icon-window").classList).toEqual("active-icon")

    })

    test("Then new bill button exist", () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      const user = JSON.stringify({
        type: 'Employee',
        status: "connected"
      })
      window.localStorage.setItem('user', user)

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const billsCont = new BillsContainer({document, onNavigate, firestore: null, localStorage: window.localStorage})
      const html = BillsUI({ data: billsCont.getBills() })

      expect(getByTestId(document.body, "btn-new-bill")).toBeTruthy()

    })

    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills }) 
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    describe(" and I click on New Bill button", () => {

      test("Then New Bill form is displayed", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        const user = JSON.stringify({
          type: 'Employee',
          status: "connected"
        })

        window.localStorage.setItem('user', user)

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const billsCont = new BillsContainer({document, onNavigate, firestore: null, localStorage: window.localStorage})

        const handleClickNewBill = jest.fn((e) => billsCont.handleClickNewBill(e))
        const btnNewBill = screen.getByTestId('btn-new-bill')
        btnNewBill.addEventListener('click', handleClickNewBill)
        userEvent.click(btnNewBill)

        expect(handleClickNewBill).toHaveBeenCalled()
        
        expect(getByTestId(document.body, "form-new-bill")).toBeTruthy()

      })

    })

    describe(" and I click on New Bill button", () => {

      test("Then New Bill form is displayed", () => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        const user = JSON.stringify({
          type: 'Employee',
          status: "connected"
        })

        window.localStorage.setItem('user', user)

        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }

        const billsCont = new BillsContainer({document, onNavigate, firestore: null, localStorage: window.localStorage})
        const html = BillsUI({ data: bills })
        document.body.innerHTML = html

        const btnIconEye = document.querySelector('div[data-testid="icon-eye"]')
        const handleClickIconEye = jest.fn((e) => billsCont.handleClickIconEye(btnIconEye))
        btnIconEye.addEventListener('click', handleClickIconEye)
        userEvent.click(btnIconEye)

        expect(handleClickIconEye).toHaveBeenCalled()
        
        expect(document.body.classList).toBe("modal-body")

      })

    })

  })
})
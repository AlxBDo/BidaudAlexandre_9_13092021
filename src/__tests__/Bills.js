/**
* @jest-environment jsdom
*/

import { screen, getByTestId, fireEvent, getAllByTestId } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import BillsUI from "../views/BillsUI.js"
import BillsContainer from '../containers/Bills'
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { bills } from "../fixtures/bills"
import Router from "../app/Router"
import  firestore from "../app/Firestore.js"
import firebase from "../__mocks__/firebase"


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {

      jest.mock('../app/Firestore')
      firestore.bills = () => ({ bills, get: jest.fn().mockResolvedValue() })
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      const user = JSON.stringify({
        type: 'Employee',
        status: "connected"
      })
      window.localStorage.setItem('user', user)

      Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['Bills'] }})

      document.body.innerHTML = '<div id="root"></div>' 
      
      Router()

      expect(getByTestId(document.body, "icon-window")).toHaveClass("active-icon")

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

    test("Then iconEye button exist", () => {

      document.body.innerHTML = BillsUI({ data: bills })
      expect(getAllByTestId(document.body, "icon-eye")).toBeTruthy()

    })

    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills }) 
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    describe(" and I click New Bill button", () => {

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

    describe(" and I click an IconEye", () => {

      test("Then modalFile is opened", () => {

        document.body.innerHTML = BillsUI({ data: bills })

        const billsCont = jest.fn(new BillsContainer({document, onNavigate: null, firestore: null, localStorage: null}))
        const handleClickIconEye = jest.fn(billsCont.handleClickIconEye)
        const iconEye = getAllByTestId(document.body, "icon-eye")

        let btnIconEyeLength = iconEye.length
        iconEye.forEach(icon => { 
          icon.addEventListener('click', handleClickIconEye) 
          userEvent.click(icon)
          expect(icon.getAttribute("data-bill-url")).toBe(document.querySelector(".modal-body div img").getAttribute("src"))
        })

        expect(handleClickIconEye).toHaveBeenCalledTimes(btnIconEyeLength)
        expect(document.getElementById("modaleFile")).toBeTruthy()
        expect(screen.getAllByText('Justificatif')).toBeTruthy()

      })

    })

  })
})

describe("Given I am not connected", () => {
  describe("When I am on Bills Page", () => {
    test("Then iconEye button not exist", () => {

      document.body.innerHTML = BillsUI({ data: [] })
      new BillsContainer({document, onNavigate: null, firestore: null, localStorage: null})
      const iconEye = document.querySelector('div[data-testid="icon-eye"]')
      
      expect(iconEye).not.toBeInTheDocument()

    })
  })
})



// Test d'integration GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills page", () => {
    test("fetches bills from mock API GET", async () => {
       const getSpy = jest.spyOn(firebase, "get")
       const bills = await firebase.get()
       document.body.innerHTML = BillsUI({data: bills.data})
       const tbody = screen.getByTestId("tbody")
       expect(getSpy).toHaveBeenCalledTimes(1)
       expect(tbody).toBeTruthy()
       expect(document.querySelectorAll('tbody tr').length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})
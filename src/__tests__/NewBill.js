/**
* @jest-environment jsdom
*/

import { screen, getByTestId, fireEvent } from "@testing-library/dom"
import '@testing-library/jest-dom'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import userEvent from '@testing-library/user-event'
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES } from "../constants/routes"
import Firestore from "../app/Firestore"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then it should show new bill form", () => {
      
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      const user = JSON.stringify({
        type: 'Employee',
        status: "connected"
      })

      window.localStorage.setItem('user', user)
      
      const html = NewBillUI()
      document.body.innerHTML = html
      
      const nwBi = new NewBill({
        document,
        onNavigate: null,
        firestore: null, 
        localStorage: window.localStorage
      })
      expect(getByTestId(document.body, "form-new-bill")).toBeTruthy()
    })
    describe(" And I upload a receipt in the wrong format", () => {
      test("Then input file have error class", () => {
                
        const html = NewBillUI()
        document.body.innerHTML = html
        
        const nwBi = new NewBill({
          document,
          onNavigate: null,
          Firestore, 
          localStorage: window.localStorage
        })

        const fileInput = screen.getByTestId("file") 
        const fileUpload = new File(['hello'], 'hello.txt', {type: 'text/plain'})

        const handleChangeFile = jest.fn((e) => nwBi.handleChangeFile(e))

        fileInput.addEventListener('change', handleChangeFile)
        userEvent.upload(fileInput, fileUpload) 
        
        expect(handleChangeFile).toHaveBeenCalled()

        expect(getByTestId(document.body, "file").files[0]).toStrictEqual(fileUpload) 

        expect(getByTestId(document.body, "file")).toHaveClass("error")

      })
    })
    describe(" And I submit it", () => {
      test("Then, it should render Bills page", () => {
      
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        const user = JSON.stringify({
          type: 'Employee',
          status: "connected"
        })
  
        window.localStorage.setItem('user', user)
        
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        
        const html = NewBillUI()
        document.body.innerHTML = html
        
        const nwBi = new NewBill({
          document,
          onNavigate,
          firestore: null, 
          localStorage: window.localStorage
        })

        const form = screen.getByTestId("form-new-bill")
        const handleSubmit = jest.fn((e) => nwBi.handleSubmit(e))  
    
        form.addEventListener("submit", handleSubmit)
        fireEvent.submit(form) 
        
        expect(handleSubmit).toHaveBeenCalled()
        expect(screen.getAllByText('Mes notes de frais')).toBeTruthy()
      })
    })
  })
})


// Test d'integration POST
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills page", () => {
    test("fetches new bill from mock API POST", async () => {
      jest.mock('../app/Firestore')
      const email = "cedric.hiely@billed.com"
      const bill = {
        email,
        type: "Employee",
        name:  "Test 2 test",
        amount: 100,
        date:  "2021/10/04",
        vat: 20,
        pct: 20,
        commentary: "Mon test de jest est un succès",
        fileUrl: "chemin/demon/fichier",
        fileName: "monjustif.jpeg",
        status: 'pending'
      }
      Firestore.bill = () => ({ bill, post: jest.fn().mockResolvedValue() })
      const getSpy = jest.spyOn(Firestore, "bill")
      const postReturn = Firestore.bill(bill)
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(postReturn.bill).toEqual(bill)
    })
  })
})
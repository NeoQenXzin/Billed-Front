/**
 * @jest-environment jsdom
 */

import { fireEvent, getByTestId, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import store from "../__mocks__/store.js"
import mockStore from '../__mocks__/store'
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import BillsUI from "../views/BillsUI.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    
    let newBill ;
    beforeEach(() => {
      const html = NewBillUI()
      document.body.innerHTML = html
      newBill = new NewBill(
        {
          document,
          store: store,
          onNavigate : (pathname) => 
          document.body.innerHTML = ROUTES({ pathname }),
          localStorage: window.localStorage
        })
      })
      
    test("Then, Title is 'Envoyer une note de frais' and all input are present", () => {
      // Je récupère le text de la page pour controller qu'elle a bien été reçu
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
      expect(screen.getByText('Type de dépense')).toBeTruthy()
      expect(screen.getByTestId('form-new-bill')).toBeTruthy()
      expect(screen.getByTestId('commentary')).toBeTruthy()
      expect(screen.getByTestId('vat')).toBeTruthy()
      expect(screen.getByTestId('pct')).toBeTruthy()
      expect(screen.getByTestId('amount')).toBeTruthy()
      expect(screen.getByTestId('expense-name')).toBeTruthy()
      expect(screen.getByTestId('expense-type')).toBeTruthy()
      expect(screen.getByTestId('datepicker')).toBeTruthy()
      expect(screen.getByTestId('file')).toBeTruthy()
    })
    
  
  describe('When I select a file', () => {
    test("Then, the input change and the extension file is verified ", async () => {
      // Configurer un mail pour entrer dans un compte utilisateur
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" })); 
      const inputFile =  screen.getByTestId('file')
      const HandleChangeFile = jest.fn(newBill.HandleChangeFile)
      inputFile.addEventListener('change', HandleChangeFile)
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["fileTest.png"], "fileTest.png", { type: "image/png"}),
          new File(["fileTes1t.zip"], "fileTes1t.zip", { type: "zip"})]
        }
      })
      expect(HandleChangeFile).toHaveBeenCalled()
      expect(inputFile.files[0].name).toBe("fileTest.png")

    })
  })
  describe('When I submit the form', () => {
    test("Then, submit the form call the fonction to create a new bill", () => {
      const newBillForm = screen.getByTestId('form-new-bill')
      const handleSubmit = jest.fn(newBill.handleSubmit)
      newBillForm.addEventListener('submit', handleSubmit)
      fireEvent.submit(newBillForm)
      expect(handleSubmit).toHaveBeenCalled()
    })
  })

  // Test Post integration
  describe("When I post a new bill ", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })

    
    test("Then, a bill is create", async () => {
      
      const request = await store.bills().update()
      expect(request.type).toBe("Hôtel et logement")
      
    })
  })
  test("post bill from mock API and fails with 404 message error", async () => {
    
    jest.mock("../app/store", () => mockStore)

    mockStore.bills.mockImplementationOnce(() => {
      return {
        create : (bill) =>  {
          return Promise.reject(new Error("Erreur 404"))
        }
      }})
      
      const html = BillsUI({error:"Erreur 404"})
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
  })

  test("post bill from mock API and fails with 500 message error", async () => {

    mockStore.bills.mockImplementationOnce(() => {
      return {
        create : (bill) =>  {
          return Promise.reject(new Error("Erreur 500"))
        }
      }})
    const html = BillsUI({error:"Erreur 500"})
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
  })
  })
})

  

  
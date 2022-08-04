/**
 * @jest-environment jsdom
 */

import { fireEvent, getByTestId, screen, waitFor, toContainHTML } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

import { formatDate } from "../app/format.js"

const bill = {
  "id": "47qAXb6fIm2zOKkLzMro",
  "vat": "80",
  "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
  "status": "accepted",
  "type": "Hôtel et logement",
  "commentAdmin": "ok",
  "commentary": "séminaire billed",
  "name": "encore",
  "fileName": "preview-facture-free-201801-pdf-1.jpg",
  "date": "2004-04-04",
  "amount": 400,
  "email": "a@a",
  "pct": 20
}

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    
    let newBill ;
    beforeEach(() => {
      const html = NewBillUI()
      document.body.innerHTML = html
      newBill = new NewBill(
        {
          document,
          store: null,
          onNavigate : (pathname) => 
          document.body.innerHTML = ROUTES({ pathname }),
          localStorage: window.localStorage
        })
      })
      
    test("Then Title is 'Envoyer une note de frais'", () => {
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
    test("Then the input change", () => {
      // Configurer un mail pour entrer dans un compte utilisateur
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" })); 
      const inputFile = screen.getByTestId('file')
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
      
      const verifFileExtension = newBill.verifFileExtension(inputFile.files[0].name)
      expect(verifFileExtension).toBeTruthy()
      const verifFileExtension1 = newBill.verifFileExtension(inputFile.files[1].name)
      expect(verifFileExtension1).toBeFalsy()
      
      console.log(verifFileExtension)
      
    })
  })
  describe('When I submit the form', () => {
    test("Then submit the form create a new bill", () => {
      const newBillForm = screen.getByTestId('form-new-bill')
      const handleSubmit = jest.fn(newBill.handleSubmit)
      newBillForm.addEventListener('submit', handleSubmit)
      fireEvent.submit(newBillForm)
      expect(handleSubmit).toHaveBeenCalled()

    })
  })

  describe("When I create a new bill", () => {
    test("", ( )=> {

    })
  })
  
})
})

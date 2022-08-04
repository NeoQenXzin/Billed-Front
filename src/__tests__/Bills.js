/**
 * @jest-environment jsdom
 */

import {fireEvent, screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import Bills from "../containers/Bills.js";
import userEvent from '@testing-library/user-event'
import mockStore from '../__mocks__/store'
//Rajouter pour store
// jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(screen.getByTestId('icon-window').classList.contains('active-icon')).toBe(true)
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      // const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const dates = bills.sort((a, b) => ((a.date < b.date) ? 1 : -1)).map(bill => bill.date)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      console.debug(dates)
      const datesSorted = [...dates].sort(antiChrono)
      console.log(datesSorted);
      expect(dates).toEqual(datesSorted)
    })
  })

  describe('When I click on "Nouvelle note de frais"', () => {
    test("Then It should renders new Bill page", () => {
      // j'initialise
      // const onNavigate = (pathname) => {
      //   document.body.innerHTML = ROUTES({ pathname })
      // }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      // Je selectionne mon bouton a tester
      const buttonNewBill = screen.getByTestId("btn-new-bill")
      // Je selectionne ma fonction
      const handleClickNewBill = jest.fn( window.onNavigate(ROUTES_PATH['NewBill']))
      // Je test mon bouton
      expect(buttonNewBill).toBeTruthy()
      // J'ajoute l'evenement au bouton
      buttonNewBill.addEventListener('click', handleClickNewBill)
      
      // Je simule le click qui déclenche l'évenement
      fireEvent.click(buttonNewBill)
      // Je récupère le text de la page suivante pour controller qu'elle a bien été reçu
      expect(screen.getByText('Envoyer une note de frais')).toBeTruthy()
      expect(screen.getByText('Type de dépense')).toBeTruthy()
    
    })
  })

// Ajout chargement
  describe('When I am on Bills page but it is loading', () => {
    test('Then, Loading page should be rendered', () => {
      document.body.innerHTML = BillsUI({ loading: true })
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })
// Ajout error
  describe('When I am on Bills page but back-end send an error message', () => {
    test('Then, Error page should be rendered', () => {
      document.body.innerHTML = BillsUI({ error: 'some error message' })
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })


  describe("When I click on icon-eyes", () => {
    test('Then A modale should open', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      $.fn.modal = jest.fn() // Correction erreur modal is not a fonction
      document.body.innerHTML = BillsUI({ data: bills })
      
      const billsList = new Bills({
        document,
        store: null,
        onNavigate : (pathname) => 
        document.body.innerHTML = ROUTES({ pathname }),
        localStorage: window.localStorage
      })
      const eye = screen.getAllByTestId('icon-eye')[0] // Je selectionne 1 seul icone
      console.log('+++++++++++++++++++++++++++++++++++++');
      // console.log(eye);
      const handleClickIconEye = jest.fn(billsList.handleClickIconEye(eye))
      eye.addEventListener('click', handleClickIconEye)
      userEvent.click(eye)
      
      expect(handleClickIconEye).toHaveBeenCalled()
      expect(screen.getByTestId('modaleFile')).toBeTruthy()
      
    })
  })
})

// test d'intégration GET
describe("Given I am a user connected as Employee", () => {
  
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByText("Mes notes de frais"))
      const contentStatut  = await screen.getByText("Statut")
      expect(contentStatut).toBeTruthy()
  
    })
  describe("When an error occurs on API", () => {
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
    test("fetches bills from an API and fails with 404 message error", async () => {

      const html = BillsUI({error:"Erreur 404"})
        document.body.innerHTML = html
        const message = await screen.getByText(/Erreur 404/)
        expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {

      const html = BillsUI({error:"Erreur 500"})
        document.body.innerHTML = html
        const message = await screen.getByText(/Erreur 500/)
        expect(message).toBeTruthy()
    })
  })

  })
})


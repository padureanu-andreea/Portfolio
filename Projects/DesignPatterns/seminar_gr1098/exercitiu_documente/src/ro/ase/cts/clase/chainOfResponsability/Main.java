package ro.ase.cts.clase.chainOfResponsability;

import ro.ase.cts.clase.adapter.DocumentJuridicExtern;

public class Main {
    public static void main(String[] args) {
        AbstractValidatorDocument validatorAnexa = new ValidareAnexa();
        AbstractValidatorDocument validatorSemnatura = new ValidareSemnatura();
        AbstractValidatorDocument validatorFormat = new ValidareFormat();
        AbstractValidatorDocument validatorCompletitudine = new ValidareCompletitudine();

        validatorFormat.seteazaUrmator(validatorCompletitudine);
        validatorCompletitudine.seteazaUrmator(validatorAnexa);
        validatorAnexa.seteazaUrmator(validatorSemnatura);

        Document doc1 = new Document(true, true, false, false);
        Document doc2 = new Document(true, true, true, true);

        System.out.println("Document 1: " + validatorFormat.valideaza(doc1));
        System.out.println("Document 2: " + validatorFormat.valideaza(doc2));


    }
}

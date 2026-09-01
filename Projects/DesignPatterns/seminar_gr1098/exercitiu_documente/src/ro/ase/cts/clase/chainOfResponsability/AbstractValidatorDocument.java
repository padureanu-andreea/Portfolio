package ro.ase.cts.clase.chainOfResponsability;

import ro.ase.cts.clase.adapter.DocumentJuridicExtern;

public abstract class AbstractValidatorDocument {
    protected AbstractValidatorDocument urmator;

    public void seteazaUrmator(AbstractValidatorDocument urmator){
        this.urmator = urmator;
    }

    public abstract boolean valideaza(Document document);
}

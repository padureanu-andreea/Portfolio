package ro.ase.cts.clase.decorator;

import ro.ase.cts.clase.INotaDePlata;

public class NotaDePlata1Mai extends NotaDePlataDecorator{
    public NotaDePlata1Mai(INotaDePlata nota) {
        super(nota);
    }

    @Override
    public void printeazaFelicitare() {
        System.out.println("1 mai grataresc!");
    }
}

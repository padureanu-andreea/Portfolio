package ro.ase.cts.clase.decorator;

import ro.ase.cts.clase.INotaDePlata;

public class NotaDePlataNoulAn extends NotaDePlataDecorator{
    public NotaDePlataNoulAn(INotaDePlata nota) {
        super(nota);
    }

    @Override
    public void printeazaFelicitare() {
        System.out.println("An nou fericit! La multi ani!");
    }
}

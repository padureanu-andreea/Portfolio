package ro.ase.cts.clase.flyweight.main;

import ro.ase.cts.clase.flyweight.AbstractPictogramaPersonalizare;
import ro.ase.cts.clase.flyweight.PictogrameFactory;
import ro.ase.cts.clase.flyweight.PictogramePersonalizareFlyweight;

public class Main {
    public static void main(String[] args) {
        AbstractPictogramaPersonalizare pictogramaCadou = new PictogramePersonalizareFlyweight("cadou");
        pictogramaCadou.afiseaza(3, 6, 6, "pictograma cadou email");
        AbstractPictogramaPersonalizare pictogramaCadou2 = new PictogramePersonalizareFlyweight("cadou");
        pictogramaCadou2.afiseaza(4, 7, 8, "pictograma cadou cos cumparaturi");
        AbstractPictogramaPersonalizare pictogramaReducere = new PictogramePersonalizareFlyweight("reducere");
        pictogramaReducere.afiseaza(7, 9, 12, "pictograma reducere pagina produsului");

        PictogrameFactory fabricaPictograme = new PictogrameFactory();

        AbstractPictogramaPersonalizare pictograma1 = fabricaPictograme.getPictograma("cadou");
        pictograma1.afiseaza(2, 5, 6, "cadou email");
        AbstractPictogramaPersonalizare pictograma2 = fabricaPictograme.getPictograma("cadou");
        pictograma2.afiseaza(5, 9, 13, "cadou pagina produs");
        AbstractPictogramaPersonalizare pictograma3 = fabricaPictograme.getPictograma("reducere");
        pictograma3.afiseaza(2, 6, 9, "reducere cos cumparaturi");

        System.out.println((pictograma1==pictograma2));
        System.out.println((pictogramaCadou==pictogramaCadou2));

    }
}

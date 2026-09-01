package ro.ase.cts.clase.decorator.main;

import ro.ase.cts.clase.decorator.*;

public class Main {
    public static void main(String[] args) {
        AbstractProdusPersonalizat produsStandard = new ProdusStandard("Tricou alb", 50);
        System.out.println(produsStandard.obtineDescriere());
        System.out.println("Pretul initial este: " + produsStandard.calculeazaPret());

        produsStandard = new TextPersonalizat(produsStandard);
        produsStandard = new LivrareCadou(produsStandard);
        produsStandard = new ImagineImprimata(produsStandard);

        System.out.println(produsStandard.obtineDescriere());
        System.out.println("Noul pret este: " + produsStandard.calculeazaPret());

        AbstractProdusPersonalizat cana = new ProdusStandard("Cana de cafea", 28);

        cana = new TextPersonalizat(cana);

        System.out.println(cana.obtineDescriere());
        System.out.println("Noul pret este: " + cana.calculeazaPret());
    }
}

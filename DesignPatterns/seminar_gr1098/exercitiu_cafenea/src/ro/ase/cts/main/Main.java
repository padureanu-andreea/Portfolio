package ro.ase.cts.main;

import ro.ase.cts.clase.*;
import ro.ase.cts.fabrica.FabricaBauturi;
import ro.ase.cts.fabrica.TipBautura;

public class Main {
    public static void main(String[] args) {
        FabricaBauturi cafenea = new FabricaBauturi();
        IBautura ceai = cafenea.getBautura(TipBautura.CEAI, "Ceai de fructe de padure", 200, 10.5);
        IBautura cafea = cafenea.getBautura(TipBautura.CAFEA, "Cappucino", 300, 23.8);
        IBautura cioco = cafenea.getBautura(TipBautura.CIOCOLATA, "Ciocolata calda alba", 350, 16.0);
        IBautura cafea2 = cafenea.getBautura(TipBautura.CAFEA, "Latte cu vanilie", 300, 18.0);

        System.out.println(ceai.getDetalii());
        System.out.println(cafea.getDetalii());
        System.out.println(cafea2.getDetalii());
        System.out.println(cioco.getDetalii());

        System.out.println(cafea.getPret());

        cioco.adaugaTopping();

        ceai.preparare();

        ComandaManager casaDeMarcat = CasaDeMarcat.getInstance();
        casaDeMarcat.adaugaBautura(ceai);
        casaDeMarcat.afiseazaComanda();
        System.out.println("Total de plata " + casaDeMarcat.calculeazaPretComanda() + " lei.");

        ComandaManager altaCasaDeMarcat =  CasaDeMarcat.getInstance();
        System.out.println(casaDeMarcat==altaCasaDeMarcat);

        casaDeMarcat.reseteazaComanda();
        casaDeMarcat.adaugaBautura(cioco);
        casaDeMarcat.adaugaBautura(cafea);
        casaDeMarcat.afiseazaComanda();

        //prototype
        BauturaPresetata bauturiPresetate = new BauturaPresetata();

        bauturiPresetate.adaugaBauturaPresetata("latte vanilie", new Cafea("latte cu vanilie", 350, 18.8));
        bauturiPresetate.adaugaBauturaPresetata("ceai menta", new Ceai("ceai de menta", 400, 14.0));

        IBauturaPrototype comanda1 = bauturiPresetate.getBauturaPresetata("latte vanilie");
        IBauturaPrototype comanda2 = bauturiPresetate.getBauturaPresetata("latte vanilie");
        IBauturaPrototype comanda3 = bauturiPresetate.getBauturaPresetata("ceai menta");
        IBauturaPrototype comanda4 = bauturiPresetate.getBauturaPresetata("ceai menta");

        System.out.println(((Cafea) comanda1).getDetalii());
        System.out.println(((Cafea) comanda2).getDetalii());
        System.out.println(((Ceai) comanda3).getDetalii());
        System.out.println(((Ceai) comanda4).getDetalii());


    }
}

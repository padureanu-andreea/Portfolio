package ro.ase.cts.simplefactory.factory;

import ro.ase.cts.simplefactory.clase.MijlocDeTransport;

public class Main {
    public static void main(String[] args){
        FabricaMijloaceDeTransport depou = new FabricaMijloaceDeTransport();
        MijlocDeTransport autobuz = depou.getMijlocDeTransport(TipuriMijloaceDeTransport.AUTOBUZ, 4, "B234AND");
        MijlocDeTransport tramvai = depou.getMijlocDeTransport(TipuriMijloaceDeTransport.TRAMVAI, 8, "B66AAA");
        MijlocDeTransport troleibuz = depou.getMijlocDeTransport(TipuriMijloaceDeTransport.TROLEIBUZ, 4, "B111BBB");

        autobuz.afiseazaDetalii();
        tramvai.afiseazaDetalii();
        troleibuz.afiseazaDetalii();
    }
}

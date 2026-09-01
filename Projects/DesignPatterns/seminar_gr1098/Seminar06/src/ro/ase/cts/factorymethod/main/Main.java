package ro.ase.cts.factorymethod.main;

import ro.ase.cts.factorymethod.clase.FelDeMancare;
import ro.ase.cts.factorymethod.clase.Supa;
import ro.ase.cts.factorymethod.clase.SupaCiuperci;
import ro.ase.cts.factorymethod.enums.TipDesert;
import ro.ase.cts.factorymethod.enums.TipSupa;
import ro.ase.cts.factorymethod.fabrici.FabricaDesert;
import ro.ase.cts.factorymethod.fabrici.FabricaSupa;

public class Main {
    public static void main(String[] args) {
        FabricaDesert fabricaDesert = new FabricaDesert();
        FabricaSupa fabricaSupa = new FabricaSupa();

        FelDeMancare supaCiuperci1 = fabricaSupa.getFelDeMancare(TipSupa.CIUPERCI, 25.5f, 350.0f);
        FelDeMancare supaLegume1 = fabricaSupa.getFelDeMancare(TipSupa.LEGUME, 23.7f, 300.0f);

        FelDeMancare papanasi1 = fabricaDesert.getFelDeMancare(TipDesert.PAPANASI, 35.4f, 430.0f/*, 520*/);
        FelDeMancare clatita1 = fabricaDesert.getFelDeMancare(TipDesert.CLATITE, 20.4f, 200.0f, 334);

        supaLegume1.afisareDescriere();
        supaCiuperci1.afisareDescriere();
        papanasi1.afisareDescriere();
        clatita1.afisareDescriere();
    }
}

package ro.ase.cts.factorymethod.fabrici;

import ro.ase.cts.factorymethod.clase.FelDeMancare;
import ro.ase.cts.factorymethod.clase.SupaCiuperci;
import ro.ase.cts.factorymethod.clase.SupaLegume;
import ro.ase.cts.factorymethod.enums.TipMancare;
import ro.ase.cts.factorymethod.enums.TipSupa;

public class FabricaSupa implements FabricaAbstracta{

    @Override
    public FelDeMancare getFelDeMancare(TipMancare tipMancare, float pretSupa, float gramajSupa) {
        if(tipMancare == TipSupa.LEGUME){
            return new SupaLegume(pretSupa, gramajSupa);
        } else if(tipMancare == TipSupa.CIUPERCI){
            return new SupaCiuperci(pretSupa, gramajSupa);
        }
        return null;
    }

    @Override
    public FelDeMancare getFelDeMancare(TipMancare tipMancare, float pretDesert, float gramajDesert, int caloriiDesert) {
        return getFelDeMancare(tipMancare, pretDesert, gramajDesert);
    }
}

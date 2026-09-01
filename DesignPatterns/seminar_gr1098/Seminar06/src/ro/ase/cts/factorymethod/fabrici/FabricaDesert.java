package ro.ase.cts.factorymethod.fabrici;

import ro.ase.cts.factorymethod.clase.Clatita;
import ro.ase.cts.factorymethod.clase.FelDeMancare;
import ro.ase.cts.factorymethod.clase.Papanasi;
import ro.ase.cts.factorymethod.enums.TipDesert;
import ro.ase.cts.factorymethod.enums.TipMancare;

public class FabricaDesert implements FabricaAbstracta{
    @Override
    public FelDeMancare getFelDeMancare(TipMancare tipMancare, float pretSupa, float gramajSupa) {
        return getFelDeMancare(tipMancare, pretSupa, gramajSupa, 500);
    }

    @Override
    public FelDeMancare getFelDeMancare(TipMancare tipMancare, float pretDesert, float gramajDesert, int caloriiDesert) {
        if(tipMancare == TipDesert.CLATITE){
            return new Clatita(pretDesert, gramajDesert, caloriiDesert);
        } else if(tipMancare == TipDesert.PAPANASI){
            return new Papanasi(pretDesert, gramajDesert, caloriiDesert);
        }
        return null;
    }
}

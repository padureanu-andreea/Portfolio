package ro.ase.cts.factorymethod.fabrici;

import ro.ase.cts.factorymethod.clase.FelDeMancare;
import ro.ase.cts.factorymethod.enums.TipMancare;

public interface FabricaAbstracta {
    //facem doua metode pt ca clasele au nr diferit de atribute, o clasa are 2 atribute si ceallata are 3 -> polimorfism
    public FelDeMancare getFelDeMancare(TipMancare tipMancare, float pretSupa, float gramajSupa);
    public FelDeMancare getFelDeMancare(TipMancare tipMancare, float pretDesert, float gramajDesert, int caloriiDesert);
}

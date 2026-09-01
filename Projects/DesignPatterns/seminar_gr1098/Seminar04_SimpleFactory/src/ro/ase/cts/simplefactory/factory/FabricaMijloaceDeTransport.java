package ro.ase.cts.simplefactory.factory;

import ro.ase.cts.simplefactory.clase.Autobuz;
import ro.ase.cts.simplefactory.clase.MijlocDeTransport;
import ro.ase.cts.simplefactory.clase.Tramvai;
import ro.ase.cts.simplefactory.clase.Troleibuz;

public class FabricaMijloaceDeTransport {
    public MijlocDeTransport getMijlocDeTransport(TipuriMijloaceDeTransport tip, int numarRoti, String numarInmatriculare) {
        //mergea si cu 3 if uri
        switch (tip) {
            case AUTOBUZ -> {
                return new Autobuz(numarRoti, numarInmatriculare);
            }
            case TRAMVAI -> {
                return new Tramvai(numarRoti, numarInmatriculare);
            }
            case TROLEIBUZ -> {
                return new Troleibuz(numarRoti, numarInmatriculare);
            }
        }
        return null;
    }
}

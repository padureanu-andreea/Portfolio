package ro.ase.cts.fabrica;

import ro.ase.cts.clase.Cafea;
import ro.ase.cts.clase.Ceai;
import ro.ase.cts.clase.CiocolataCalda;
import ro.ase.cts.clase.IBautura;

public class FabricaBauturi {
    public IBautura getBautura(TipBautura tipBautura, String numeBautura, int volumBautura, double pretBautura){
        if(tipBautura.equals(TipBautura.CEAI)){
            return new Ceai(numeBautura, volumBautura, pretBautura);
        } else if (tipBautura.equals(TipBautura.CAFEA)) {
            return new Cafea(numeBautura, volumBautura, pretBautura);
        } else if (tipBautura.equals(TipBautura.CIOCOLATA)) {
            return new CiocolataCalda(numeBautura, volumBautura, pretBautura);
        }
        return null;
    }
}

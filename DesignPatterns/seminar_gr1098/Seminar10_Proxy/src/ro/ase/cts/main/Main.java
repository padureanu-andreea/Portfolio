package ro.ase.cts.main;

import ro.ase.cts.clase.*;

public class Main {
    public static void main(String[] args) {
        MijlocDeTransport autobuz168 = new Autobuz(14, 168);
        MijlocDeTransport autobuz226 = new Autobuz(0, 226);

        Statie statieRomana = new Statie("Piata Romana", 20);
        Statie statieUniversitate = new Statie("Universitate", 0);

        autobuz168.opresteInStatie(statieRomana);
        autobuz226.opresteInStatie(statieUniversitate);

        MijlocDeTransport autobuzDeNoapte168 = new AutobuzDeNoapteProxy(autobuz168);
        MijlocDeTransport autobuzDeNoapte226 = new AutobuzDeNoapteProxy(autobuz226);

        autobuzDeNoapte168.opresteInStatie(statieRomana);
        autobuzDeNoapte226.opresteInStatie(statieUniversitate);

        MijlocDeTransport autobuz = new Autobuz(12, 368, TipCursa.CURSA_SPECIALA);
        MijlocDeTransport autobuzCursaSpeciala = new AutobuzCursaSpecialaProxy(autobuz);
        MijlocDeTransport autobuzCursaSpeciala168 = new AutobuzCursaSpecialaProxy(autobuz168);
        autobuzCursaSpeciala.opresteInStatie(statieRomana);
        autobuzCursaSpeciala168.opresteInStatie(statieUniversitate);
    }
}

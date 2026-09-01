package ro.ase.cts.clase;

import java.util.List;

public abstract class AJucator {
	protected String numeJucator;
	protected List<IAntrenament> listaAntrenamente;
	protected List<String> listaMedicamenteInterzise;
	protected ETipJucator tipJucator;
	
	//executa antrenamentul 
	public abstract void executaAntrenament(int index);
	//returneaza nivelul de forta al jucatorului
	//in functie de lista antrenamentelor executate
	public abstract float getNivelForta();
	//daca se identifica noi medicamente interzise, se adauga in lista
	//pentru ca toti sportivii sa fie testati si de acel medicament
	public abstract void addMedicamentInterzis(String medicament);
	public abstract boolean testareAntiDoping();
	
}

package ro.ase.cts.clase;

import java.util.Arrays;

public abstract class Aplicant{
	protected String nume;
	protected String prenume;
	protected int varsta;
	protected int punctaj;
	protected int nr_proiecte;
	protected String[] denumireProiect;
	protected static int PUNCTAJ_MINIM=80;
	
	public String getNume() {
		return nume;
	}
	public void setNume(String nume) {
		this.nume = nume;
	}
	public String getPrenume() {
		return prenume;
	}
	public void setPrenume(String prenume) {
		this.prenume = prenume;
	}
	public int getVarsta() {
		return varsta;
	}
	public void setVarsta(int varsta) {
		this.varsta = varsta;
	}
	public void afiseazaStatut(){
		StringBuilder builder = new StringBuilder();
		builder.append("Aplicantul ");
		builder.append(this.nume).append(" ").append(this.prenume);
		builder.append((this.punctaj>Aplicant.PUNCTAJ_MINIM)?"":" nu");
		builder.append(" a fost acceptat.");
		System.out.println(builder);
//		System.out.println("Aplicantul "+nume+" "+prenume+((this.punctaj>Aplicant.PUNCTAJ_MINIM)?"":" nu")+" a fost acceptat.");
//
//		if(this.punctaj>Aplicant.PUNCTAJ_MINIM)
//			System.out.println("Aplicantul "+nume+" "+prenume+" a fost acceptat.");
//		else
//			System.out.println("Aplicantul "+nume+" "+prenume+" nu a fost acceptat.");
		}
	public int getPunctaj() {
		return punctaj;
	}
	public void setPunctaj(int punctaj) {
		this.punctaj = punctaj;
	}
	
	

	
	public Aplicant() {
		super();
		// TODO Auto-generated constructor stub
	}
	public Aplicant(String nume, String prenume, int varsta, int punctaj, int nr_proiecte, String[] denumireProiect) {
		super();
		this.nume = nume;
		this.prenume = prenume;
		this.varsta = varsta;
		this.punctaj = punctaj;
		this.nr_proiecte = nr_proiecte;
		this.denumireProiect = denumireProiect;
	}
	public int getNr_proiecte() {
		return nr_proiecte;
	}
	public void setNr_proiecte(int nr_proiecte, String[] proiecte) {
		this.nr_proiecte = nr_proiecte;
		this.denumireProiect = proiecte;
	}

	public abstract void afiseazaFinantare();

	@Override
	public String toString() {
		final StringBuilder sb = new StringBuilder();
		sb.append("nume='").append(nume).append('\'');
		sb.append(", prenume='").append(prenume).append('\'');
		sb.append(", varsta=").append(varsta);
		sb.append(", punctaj=").append(punctaj);
		sb.append(", nr_proiecte=").append(nr_proiecte);
		sb.append(", denumireProiect=").append(Arrays.toString(denumireProiect));
		return sb.toString();
	}
}

using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace AgentieImobiliara
{
    public partial class FormularStart : Form
    {
        private string rolUtilizatorLogat = string.Empty;

        public FormularStart()
        {
            InitializeComponent();
            menuStrip1.Visible = false;
            ArataEcranLogin();
        }

        private void gestioneazaProprietatiToolStripMenuItem_Click(object sender, EventArgs e)
        {
            FormularPrincipal frmPrincipal = new FormularPrincipal("Proprietati");
            frmPrincipal.ShowDialog();
        }

        private void gestioneazaAgentiToolStripMenuItem_Click(object sender, EventArgs e)
        {
            FormularPrincipal frmPrincipal = new FormularPrincipal("Agenti");
            frmPrincipal.ShowDialog();
        }

        private void gestioneazaClientiToolStripMenuItem_Click(object sender, EventArgs e)
        {
            FormularPrincipal frmPrincipal = new FormularPrincipal("Clienti");
            frmPrincipal.ShowDialog();
        }

        private void iesireToolStripMenuItem_Click(object sender, EventArgs e)
        {
            Application.Exit();
        }

        private void cereriSiOferteToolStripMenuItem_Click(object sender, EventArgs e)
        {
            FormularPrincipal frmPrincipal = new FormularPrincipal("ModCereriOferte");
            frmPrincipal.ShowDialog();
        }

        private void statisticiToolStripMenuItem_Click(object sender, EventArgs e)
        {
            FormularPrincipal frmPrincipal = new FormularPrincipal("Statistici");
            frmPrincipal.ShowDialog();
        }

        private void vizualizareFisiereJSONToolStripMenuItem_Click(object sender, EventArgs e)
        {
            FormularPrincipal frmPrincipal = new FormularPrincipal("VizualizareFisier");
            frmPrincipal.ShowDialog();
        }

        private void pictureBox1_Click(object sender, EventArgs e)
        {

        }

        private void loginControl11_LoginSuccess(object sender, LoginEventArgs e)
        {
            this.rolUtilizatorLogat = e.Rol;
            loginControl11.Visible = false;
            menuStrip1.Visible = true;
            ConfigureazaMeniuPentruRol(this.rolUtilizatorLogat);

            MessageBox.Show($"Bun venit! Sunteți autentificat ca: {this.rolUtilizatorLogat}", "Autentificare Reușită");
        }

        private void ConfigureazaMeniuPentruRol(string rol)
        {
            if (rol == "Admin")
            {
                gestioneazaProprietatiToolStripMenuItem.Enabled = true;
                gestioneazaAgentiToolStripMenuItem.Enabled = true;
                gestioneazaClientiToolStripMenuItem.Enabled = true;
                cereriSiOferteToolStripMenuItem.Enabled = true;
                statisticiToolStripMenuItem.Enabled = true;
                vizualizareFisiereJSONToolStripMenuItem.Enabled = true;
            }
            else if (rol == "Client")
            {
                gestioneazaProprietatiToolStripMenuItem.Enabled = false;
                gestioneazaAgentiToolStripMenuItem.Enabled = false;
                gestioneazaClientiToolStripMenuItem.Enabled = false;

                cereriSiOferteToolStripMenuItem.Enabled = true;

                statisticiToolStripMenuItem.Enabled = false;
                vizualizareFisiereJSONToolStripMenuItem.Enabled = false;
            }
        }

        private void ArataEcranLogin()
        {
            this.rolUtilizatorLogat = string.Empty;

            loginControl11.GolesteCampuri();

            loginControl11.Visible = true;

            menuStrip1.Visible = false;
        }

        private void delogareToolStripMenuItem_Click(object sender, EventArgs e)
        {
            ArataEcranLogin();
        }
    }
}

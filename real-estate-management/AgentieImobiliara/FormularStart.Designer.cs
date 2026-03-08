namespace AgentieImobiliara
{
    partial class FormularStart
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(FormularStart));
            pictureBox1 = new PictureBox();
            label1 = new Label();
            menuStrip1 = new MenuStrip();
            navigareToolStripMenuItem = new ToolStripMenuItem();
            gestioneazaProprietatiToolStripMenuItem = new ToolStripMenuItem();
            gestioneazaAgentiToolStripMenuItem = new ToolStripMenuItem();
            gestioneazaClientiToolStripMenuItem = new ToolStripMenuItem();
            cereriSiOferteToolStripMenuItem = new ToolStripMenuItem();
            statisticiToolStripMenuItem = new ToolStripMenuItem();
            vizualizareFisiereJSONToolStripMenuItem = new ToolStripMenuItem();
            iesireToolStripMenuItem = new ToolStripMenuItem();
            delogareToolStripMenuItem = new ToolStripMenuItem();
            loginControl11 = new LoginControl1();
            ((System.ComponentModel.ISupportInitialize)pictureBox1).BeginInit();
            menuStrip1.SuspendLayout();
            SuspendLayout();
            // 
            // pictureBox1
            // 
            pictureBox1.Image = (Image)resources.GetObject("pictureBox1.Image");
            pictureBox1.Location = new Point(72, 41);
            pictureBox1.Name = "pictureBox1";
            pictureBox1.Size = new Size(825, 254);
            pictureBox1.SizeMode = PictureBoxSizeMode.StretchImage;
            pictureBox1.TabIndex = 0;
            pictureBox1.TabStop = false;
            pictureBox1.Click += pictureBox1_Click;
            // 
            // label1
            // 
            label1.AutoSize = true;
            label1.Font = new Font("Broadway", 20F, FontStyle.Bold, GraphicsUnit.Point, 0);
            label1.ForeColor = Color.SteelBlue;
            label1.Location = new Point(86, 231);
            label1.Name = "label1";
            label1.Size = new Size(800, 46);
            label1.TabIndex = 1;
            label1.Text = "AGENTIE IMOBILIARA - HOME PAGE";
            label1.TextAlign = ContentAlignment.MiddleCenter;
            // 
            // menuStrip1
            // 
            menuStrip1.BackColor = SystemColors.ActiveCaption;
            menuStrip1.ImageScalingSize = new Size(24, 24);
            menuStrip1.Items.AddRange(new ToolStripItem[] { navigareToolStripMenuItem, iesireToolStripMenuItem, delogareToolStripMenuItem });
            menuStrip1.Location = new Point(0, 0);
            menuStrip1.Name = "menuStrip1";
            menuStrip1.Size = new Size(978, 33);
            menuStrip1.TabIndex = 2;
            menuStrip1.Text = "menuStrip1";
            // 
            // navigareToolStripMenuItem
            // 
            navigareToolStripMenuItem.DropDownItems.AddRange(new ToolStripItem[] { gestioneazaProprietatiToolStripMenuItem, gestioneazaAgentiToolStripMenuItem, gestioneazaClientiToolStripMenuItem, cereriSiOferteToolStripMenuItem, statisticiToolStripMenuItem, vizualizareFisiereJSONToolStripMenuItem });
            navigareToolStripMenuItem.Name = "navigareToolStripMenuItem";
            navigareToolStripMenuItem.Size = new Size(98, 29);
            navigareToolStripMenuItem.Text = "Navigare";
            // 
            // gestioneazaProprietatiToolStripMenuItem
            // 
            gestioneazaProprietatiToolStripMenuItem.BackColor = SystemColors.InactiveCaption;
            gestioneazaProprietatiToolStripMenuItem.Name = "gestioneazaProprietatiToolStripMenuItem";
            gestioneazaProprietatiToolStripMenuItem.Size = new Size(298, 34);
            gestioneazaProprietatiToolStripMenuItem.Text = "Gestioneaza Proprietati";
            gestioneazaProprietatiToolStripMenuItem.Click += gestioneazaProprietatiToolStripMenuItem_Click;
            // 
            // gestioneazaAgentiToolStripMenuItem
            // 
            gestioneazaAgentiToolStripMenuItem.BackColor = SystemColors.InactiveCaption;
            gestioneazaAgentiToolStripMenuItem.Name = "gestioneazaAgentiToolStripMenuItem";
            gestioneazaAgentiToolStripMenuItem.Size = new Size(298, 34);
            gestioneazaAgentiToolStripMenuItem.Text = "Gestioneaza Agenti";
            gestioneazaAgentiToolStripMenuItem.Click += gestioneazaAgentiToolStripMenuItem_Click;
            // 
            // gestioneazaClientiToolStripMenuItem
            // 
            gestioneazaClientiToolStripMenuItem.BackColor = SystemColors.InactiveCaption;
            gestioneazaClientiToolStripMenuItem.Name = "gestioneazaClientiToolStripMenuItem";
            gestioneazaClientiToolStripMenuItem.Size = new Size(298, 34);
            gestioneazaClientiToolStripMenuItem.Text = "Gestioneaza Clienti";
            gestioneazaClientiToolStripMenuItem.Click += gestioneazaClientiToolStripMenuItem_Click;
            // 
            // cereriSiOferteToolStripMenuItem
            // 
            cereriSiOferteToolStripMenuItem.BackColor = SystemColors.InactiveCaption;
            cereriSiOferteToolStripMenuItem.Name = "cereriSiOferteToolStripMenuItem";
            cereriSiOferteToolStripMenuItem.Size = new Size(298, 34);
            cereriSiOferteToolStripMenuItem.Text = "Cereri si Oferte";
            cereriSiOferteToolStripMenuItem.Click += cereriSiOferteToolStripMenuItem_Click;
            // 
            // statisticiToolStripMenuItem
            // 
            statisticiToolStripMenuItem.BackColor = SystemColors.InactiveCaption;
            statisticiToolStripMenuItem.Name = "statisticiToolStripMenuItem";
            statisticiToolStripMenuItem.Size = new Size(298, 34);
            statisticiToolStripMenuItem.Text = "Vizualizare Statistici";
            statisticiToolStripMenuItem.Click += statisticiToolStripMenuItem_Click;
            // 
            // vizualizareFisiereJSONToolStripMenuItem
            // 
            vizualizareFisiereJSONToolStripMenuItem.BackColor = SystemColors.InactiveCaption;
            vizualizareFisiereJSONToolStripMenuItem.Name = "vizualizareFisiereJSONToolStripMenuItem";
            vizualizareFisiereJSONToolStripMenuItem.Size = new Size(298, 34);
            vizualizareFisiereJSONToolStripMenuItem.Text = "Vizualizare Fisiere JSON";
            vizualizareFisiereJSONToolStripMenuItem.Click += vizualizareFisiereJSONToolStripMenuItem_Click;
            // 
            // iesireToolStripMenuItem
            // 
            iesireToolStripMenuItem.Name = "iesireToolStripMenuItem";
            iesireToolStripMenuItem.Size = new Size(69, 29);
            iesireToolStripMenuItem.Text = "Iesire";
            iesireToolStripMenuItem.Click += iesireToolStripMenuItem_Click;
            // 
            // delogareToolStripMenuItem
            // 
            delogareToolStripMenuItem.BackColor = SystemColors.ActiveCaption;
            delogareToolStripMenuItem.Name = "delogareToolStripMenuItem";
            delogareToolStripMenuItem.Size = new Size(100, 29);
            delogareToolStripMenuItem.Text = "Delogare";
            delogareToolStripMenuItem.Click += delogareToolStripMenuItem_Click;
            // 
            // loginControl11
            // 
            loginControl11.BackColor = SystemColors.InactiveCaption;
            loginControl11.Location = new Point(176, 301);
            loginControl11.Name = "loginControl11";
            loginControl11.Size = new Size(596, 331);
            loginControl11.TabIndex = 3;
            loginControl11.LoginSuccess += loginControl11_LoginSuccess;
            // 
            // FormularStart
            // 
            AutoScaleDimensions = new SizeF(10F, 25F);
            AutoScaleMode = AutoScaleMode.Font;
            BackColor = SystemColors.InactiveCaption;
            ClientSize = new Size(978, 644);
            Controls.Add(loginControl11);
            Controls.Add(label1);
            Controls.Add(pictureBox1);
            Controls.Add(menuStrip1);
            MainMenuStrip = menuStrip1;
            Name = "FormularStart";
            Text = "FormularStart";
            ((System.ComponentModel.ISupportInitialize)pictureBox1).EndInit();
            menuStrip1.ResumeLayout(false);
            menuStrip1.PerformLayout();
            ResumeLayout(false);
            PerformLayout();
        }

        #endregion

        private PictureBox pictureBox1;
        private Label label1;
        private MenuStrip menuStrip1;
        private ToolStripMenuItem navigareToolStripMenuItem;
        private ToolStripMenuItem gestioneazaProprietatiToolStripMenuItem;
        private ToolStripMenuItem gestioneazaAgentiToolStripMenuItem;
        private ToolStripMenuItem gestioneazaClientiToolStripMenuItem;
        private ToolStripMenuItem iesireToolStripMenuItem;
        private ToolStripMenuItem cereriSiOferteToolStripMenuItem;
        private ToolStripMenuItem statisticiToolStripMenuItem;
        private ToolStripMenuItem vizualizareFisiereJSONToolStripMenuItem;
        private LoginControl1 loginControl11;
        private ToolStripMenuItem delogareToolStripMenuItem;
    }
}
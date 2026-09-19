"""Seed initial research enclave data into PostgreSQL."""
from sqlalchemy import text
from app.db import SessionLocal, engine
from app.auth import pwd_context
from app.models import Project, ProjectMember, FileRecord, ActivityEvent, User, ProjectInvitation

def seed():
    with SessionLocal() as db:
        # Seed users if not already present
        admin_user = db.query(User).filter(User.email == "admin@bayero.edu.ng").first()
        if not admin_user:
            admin = User(
                id="admin_001",
                email="admin@bayero.edu.ng",
                hashed_password=pwd_context.hash("SeVRdemo2026!"),
                role="system_admin",
                name="System Administrator",
                title="Prof",
                edu_status="PI",
                department="Center for Information Technology",
                faculty="Computer Science & IT",
                profile_completed=True,
            )
            researcher = User(
                id="user_001",
                email="researcher@bayero.edu.ng",
                hashed_password=pwd_context.hash("SeVRdemo2026!"),
                role="supervisor",
                name="Dr. Ada Okafor",
                title="Dr",
                edu_status="Staff",
                department="Environmental Sciences",
                faculty="Faculty of Earth and Environmental Sciences",
                profile_completed=True,
            )
            jamil = User(
                id="user_002",
                email="jamil@bayero.edu.ng",
                hashed_password=pwd_context.hash("SeVRdemo2026!"),
                role="researcher",
                name="Jamil Yusuf",
                title="Mr",
                edu_status="Student",
                student_cadre="Postgraduate",
                student_level="MSc",
                department="Environmental Sciences",
                faculty="Faculty of Earth and Environmental Sciences",
                profile_completed=True,
            )
            bello = User(
                id="user_003",
                email="bello@bayero.edu.ng",
                hashed_password=pwd_context.hash("SeVRdemo2026!"),
                role="researcher",
                name="Bello Aminu",
                title="Mr",
                edu_status="Staff",
                department="Genomics & Bioinformatics",
                faculty="Faculty of Science",
                profile_completed=True,
            )
            db.add_all([admin, researcher, jamil, bello])
            db.commit()
            print("Seeded default users (admin, researcher, jamil, bello).")
        else:
            print("Users already seeded.")

        # Check if projects already seeded
        existing = db.query(Project).filter(Project.id == "proj_1").first()
        if existing:
            print("Database already contains seed projects.")
            return

        # Project 1
        p1 = Project(
            id="proj_1",
            name="Rural Groundwater Contamination Study",
            description="Field research and contamination analysis across rural sampling sites in the Chad Basin.",
            default_tlp="AMBER",
        )
        db.add(p1)

        # Members for Project 1
        m1 = ProjectMember(
            id="member_1",
            project_id="proj_1",
            name="Dr. Ada Okafor",
            email="researcher@bayero.edu.ng",
            role="Supervisor",
            department="Environmental Sciences",
            status="active",
        )
        m2 = ProjectMember(
            id="member_2",
            project_id="proj_1",
            name="Jamil Yusuf",
            email="jamil@bayero.edu.ng",
            role="Researcher",
            department="Environmental Sciences",
            status="active",
        )
        db.add_all([m1, m2])

        # Files for Project 1
        f1 = FileRecord(
            id="file_1",
            project_id="proj_1",
            name="draft_manuscript_v3.docx",
            original_format="docx",
            storage_path="vault/proj_1/draft_manuscript_v3.docx",
            tlp_label="AMBER",
            uploaded_by="Jamil Yusuf",
            size_bytes=1048576,
            checksum_sha256="9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
            version_count=3,
        )
        f2 = FileRecord(
            id="file_2",
            project_id="proj_1",
            name="raw_samples_2026.csv",
            original_format="csv",
            storage_path="vault/proj_1/raw_samples_2026.csv",
            tlp_label="RED",
            uploaded_by="Jamil Yusuf",
            size_bytes=4194304,
            checksum_sha256="5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
            version_count=1,
        )
        db.add_all([f1, f2])

        # Activities for Project 1
        a1 = ActivityEvent(
            id="act_1",
            project_id="proj_1",
            type="create",
            actor="Dr. Ada Okafor",
            detail="Enclave initialized with Zero-Trust protection.",
        )
        a2 = ActivityEvent(
            id="act_2",
            project_id="proj_1",
            type="upload",
            actor="Jamil Yusuf",
            detail="Uploaded draft_manuscript_v3.docx (TLP:AMBER)",
        )
        a3 = ActivityEvent(
            id="act_3",
            project_id="proj_1",
            type="upload",
            actor="Jamil Yusuf",
            detail="Uploaded raw_samples_2026.csv (TLP:RED)",
        )
        db.add_all([a1, a2, a3])

        # Project 2
        p2 = Project(
            id="proj_2",
            name="Sub-Saharan Genomic Surveillance",
            description="Pathogen genomic sequencing and antimicrobial resistance monitoring datasets.",
            default_tlp="RED",
        )
        db.add(p2)

        m3 = ProjectMember(
            id="member_3",
            project_id="proj_2",
            name="Dr. Ada Okafor",
            email="researcher@bayero.edu.ng",
            role="Supervisor",
            department="Genomics & Bioinformatics",
            status="active",
        )
        m4 = ProjectMember(
            id="member_4",
            project_id="proj_2",
            name="Bello Aminu",
            email="bello@bayero.edu.ng",
            role="Researcher",
            department="Genomics & Bioinformatics",
            status="active",
        )
        db.add_all([m3, m4])

        f3 = FileRecord(
            id="file_3",
            project_id="proj_2",
            name="pathogen_isolates_seq.fasta",
            original_format="fasta",
            storage_path="vault/proj_2/pathogen_isolates_seq.fasta",
            tlp_label="RED",
            uploaded_by="Dr. Ada Okafor",
            size_bytes=12582912,
            checksum_sha256="4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
            version_count=2,
        )
        db.add(f3)

        a4 = ActivityEvent(
            id="act_4",
            project_id="proj_2",
            type="create",
            actor="Dr. Ada Okafor",
            detail="Genomic surveillance enclave provisioned.",
        )
        db.add(a4)

        db.commit()
        print("Database seeded successfully with initial enclaves, members, files, and activity logs.")

if __name__ == "__main__":
    seed()

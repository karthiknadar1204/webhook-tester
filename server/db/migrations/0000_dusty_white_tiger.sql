CREATE TABLE "bins" (
	"id" serial PRIMARY KEY NOT NULL,
	"bin_id" varchar(36) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	CONSTRAINT "bins_bin_id_unique" UNIQUE("bin_id")
);

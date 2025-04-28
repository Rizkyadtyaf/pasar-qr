export interface Pedagang {
    id: string;
    nama_toko: string | null;
    deskripsi_toko: string | null;
    nama_lengkap: string | null;
    nomor_whatsapp: string | null;
    avatar_url: string | null;
    lokasi_toko: string | null;
    pengunjung_count: number | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface Product {
    id: string;
    pedagang_id: string;
    nama_produk: string;
    harga: number;
    stok: number;
    stok_satuan: string | null;
    foto_produk_url: string | null;
    qr_code_url: string | null;
    qr_scan_count: number | null;
    deskripsi: string | null;
    created_at: string;
    updated_at: string | null;
}
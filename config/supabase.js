const SUPABASE_URL = window.ENV?.SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = window.ENV?.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabaseClient = supabase;
async function getFormations() {
    try {
        const { data, error } = await supabase
            .from('formations')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Erreur lors du chargement des formations:', error);
        return [];
    }
}
async function saveFormation(formation) {
    try {
        console.log('🔍 Données à sauvegarder:', JSON.stringify(formation, null, 2));
        const { data, error } = await supabase
            .from('formations')
            .upsert([formation])
            .select();
        if (error) {
            console.error('❌ Erreur Supabase détaillée:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
            throw error;
        }
        console.log('✅ Formation sauvegardée:', data[0]);
        return data[0];
    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde de la formation:', error);
        throw error;
    }
}
async function deleteFormation(id) {
    try {
        const { error } = await supabase
            .from('formations')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression de la formation:', error);
        throw error;
    }
}
async function getEvents() {
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Erreur lors du chargement des événements:', error);
        return [];
    }
}
async function saveEvent(event) {
    try {
        const { data, error } = await supabase
            .from('events')
            .upsert([event])
            .select();
        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'événement:', error);
        throw error;
    }
}
async function updateEvent(id, event) {
    try {
        const { data, error } = await supabase
            .from('events')
            .update(event)
            .eq('id', id)
            .select();
        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'événement:', error);
        throw error;
    }
}
async function deleteEvent(id) {
    try {
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'événement:', error);
        throw error;
    }
}
async function getSettings() {
    try {
        const { data, error } = await supabase
            .from('settings')
            .select('*')
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data || getDefaultSettings();
    } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
        return getDefaultSettings();
    }
}
async function saveSettings(settings) {
    try {
        const { data, error } = await supabase
            .from('settings')
            .upsert([{ id: 1, ...settings }])
            .select();
        if (error) throw error;
        return data[0];
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des paramètres:', error);
        throw error;
    }
}
function getDefaultSettings() {
    return {
        siteTitle: 'Orange Digital Center - Formations & Événements du Mois',
        heroTitle: 'Orange Digital Center',
        heroSubtitle: 'Découvrez nos formations et événements dans tous nos centres Orange Digital Center',
        contactEmail: 'contact@odc.orange.ma',
        contactPhone: '',
        odcCenters: [
            { name: 'ODC Rabat', address: 'Technopolis Rabat-Shore, Rabat', phone: '' },
            { name: 'ODC Agadir', address: 'Quartier Industriel, Agadir', phone: '' },
            { name: 'ODC Ben M\'sik', address: 'Ben M\'sik, Casablanca', phone: '' },
            { name: 'ODC Sidi Maarouf', address: 'Sidi Maarouf, Casablanca', phone: '' }
        ]
    };
}
async function uploadImage(file, folder = 'formations') {
    try {
        const bucketExists = await createImageBucket();
        if (!bucketExists) {
            throw new Error('Le bucket odc-images n\'existe pas. Veuillez le créer dans Supabase Storage.');
        }
        const fileExt = file.name.split('.').pop();
        const fileName = `${generateId()}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;
        console.log('📤 Upload de l\'image:', filePath);
        const { data, error } = await supabase.storage
            .from('odc-images')
            .upload(filePath, file);
        if (error) {
            console.error('Détails erreur upload:', error);
            throw error;
        }
        const { data: publicUrlData } = supabase.storage
            .from('odc-images')
            .getPublicUrl(filePath);
        console.log('✅ Image uploadée:', publicUrlData.publicUrl);
        return publicUrlData.publicUrl;
    } catch (error) {
        console.error('❌ Erreur lors de l\'upload:', error);
        throw error;
    }
}
async function deleteImage(imageUrl) {
    try {
        if (!imageUrl || !imageUrl.includes('supabase')) {
            console.log('⚠️ Image externe, suppression ignorée');
            return true;
        }
        const urlParts = imageUrl.split('/storage/v1/object/public/odc-images/');
        if (urlParts.length < 2) {
            console.warn('⚠️ Format d\'URL non reconnu');
            return false;
        }
        const filePath = urlParts[1];
        console.log('🗑️ Suppression de l\'image:', filePath);
        const { error } = await supabase.storage
            .from('odc-images')
            .remove([filePath]);
        if (error) throw error;
        console.log('✅ Image supprimée');
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de la suppression de l\'image:', error);
        return false;
    }
}
async function getImageUrl(filePath) {
    try {
        const { data } = supabase.storage
            .from('odc-images')
            .getPublicUrl(filePath);
        return data.publicUrl;
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'URL:', error);
        return null;
    }
}
async function createImageBucket() {
    try {
        const { data, error } = await supabase.storage
            .from('odc-images')
            .list('', { limit: 1 });
        if (error) {
            if (error.message.includes('Bucket not found')) {
                console.warn('⚠️ Bucket odc-images n\'existe pas. Veuillez le créer manuellement dans Supabase Storage.');
                return false;
            }
            throw error;
        }
        console.log('✅ Bucket odc-images existe et est accessible');
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de la vérification du bucket:', error);
        console.log('💡 Solution: Créez le bucket "odc-images" manuellement dans Supabase Storage');
        return false;
    }
}
async function compressImage(file, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = function() {
            let { width, height } = img;
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(resolve, file.type, quality);
        };
        img.src = URL.createObjectURL(file);
    });
}
async function testConnection() {
    try {
        const { data, error } = await supabase
            .from('formations')
            .select('count', { count: 'exact' });
        if (error) throw error;
        console.log('✅ Connexion Supabase réussie');
        await createImageBucket();
        return true;
    } catch (error) {
        console.error('❌ Erreur de connexion Supabase:', error);
        return false;
    }
}
function generateId() {
    return crypto.randomUUID();
}
window.SupabaseAPI = {
    testConnection,
    getFormations,
    saveFormation,
    deleteFormation,
    getEvents,
    saveEvent,
    updateEvent,
    deleteEvent,
    getSettings,
    saveSettings,
    generateId,
    uploadImage,
    deleteImage,
    getImageUrl,
    compressImage,
    createImageBucket
};

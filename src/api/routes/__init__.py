from .categories import routes_category
from .images import routes_image
from .stores import routes_store
from .users import routes_user
from .products import routes_product
from .menus import routes_menu
from .userpoints import routes_userpoint
from .donations import routes_donation

# Opcional: podés agruparlos para registro masivo
__all__ = ["routes_category","routes_menu","routes_product","routes_store","routes_image","routes_user","routes_userpoint","routes_donation"]

